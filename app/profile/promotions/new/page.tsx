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
  required: string;
  maxPhotos: string;
  adWillGoLive: string;
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
const MAX_PHOTOS = 9;

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
  done: 'Payment confirmed. Advertisement will go live after payment.',
  enterCategory: 'Choose category',
  enterSubcategory: 'Choose subcategory',
  enterTitle: 'Enter ad title',
  enterDescription: 'Enter ad description',
  addPhotoAlert: 'Add at least one photo or one mini video',
  close: 'Close',
  paymentHint: 'Publication goes live only after payment confirmation.',
  firstAdBonus: 'First ad can be free for 7 days for new users after confirmation.',
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
  required: 'Required',
  maxPhotos: 'JPG / PNG / WEBP · max 9',
  adWillGoLive: 'Your ad will be published only after payment.',
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
    done: 'Оплата подтверждена. Реклама будет опубликована после оплаты.',
    enterCategory: 'Выберите категорию',
    enterSubcategory: 'Выберите подкатегорию',
    enterTitle: 'Введите название рекламы',
    enterDescription: 'Введите описание рекламы',
    addPhotoAlert: 'Добавьте хотя бы одно фото или одно мини видео',
    close: 'Закрыть',
    paymentHint: 'Публикация выйдет только после подтверждения оплаты.',
    firstAdBonus:
      'Первая реклама может быть бесплатной на 7 дней для новых пользователей после подтверждения.',
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
    required: 'Обязательно',
    maxPhotos: 'JPG / PNG / WEBP · максимум 9',
    adWillGoLive: 'Реклама будет опубликована только после оплаты.',
  },
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
    durationHint: 'Від 10 до 30 днів',
    days: 'Дні',
    photo: 'Фото',
    photoHint: 'Додайте одне або кілька фото для реклами.',
    addPhoto: 'Додати фото',
    photoSource: 'Джерело файлу',
    gallery: 'Галерея',
    camera: 'Камера',
    files: 'Файли',
    layout: 'Вигляд показу',
    layoutSingle: '1 фото',
    layoutGrid: 'Сітка 2–9',
    summary: 'Підсумок реклами',
    total: 'Разом',
    continueToPayment: 'Перейти до оплати',
    done: 'Оплата підтверджена. Реклама буде опублікована після оплати.',
    choosePaymentMethod: 'Оберіть спосіб оплати',
    paymentMethodsHint: 'Оберіть один спосіб для продовження оплати',
    confirmPayment: 'Оплатити',
    paymentHint: 'Публікація буде доступна тільки після підтвердження оплати.',
    firstAdBonus:
      'Перша реклама може бути безкоштовною на 7 днів для нових користувачів після підтвердження.',
    required: 'Обовʼязково',
    adWillGoLive: 'Реклама буде опублікована тільки після оплати.',
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
    visibilityHint: 'El anuncio se mostrará dentro del radio seleccionado.',
    radius: 'Radio',
    perDay: 'por día',
    duration: 'Duración',
    durationHint: 'De 10 a 30 días',
    days: 'Días',
    photo: 'Fotos',
    photoHint: 'Añade una o varias fotos para el anuncio.',
    addPhoto: 'Añadir fotos',
    photoSource: 'Fuente del archivo',
    gallery: 'Galería',
    camera: 'Cámara',
    files: 'Archivos',
    layout: 'Diseño',
    layoutSingle: '1 foto',
    layoutGrid: 'Cuadrícula 2–9',
    summary: 'Resumen del anuncio',
    total: 'Total',
    continueToPayment: 'Continuar al pago',
    done: 'Pago confirmado. El anuncio se publicará después del pago.',
    choosePaymentMethod: 'Elegir método de pago',
    confirmPayment: 'Pagar ahora',
    paymentHint: 'La publicación se activa solo después del pago.',
    firstAdBonus:
      'El primer anuncio puede ser gratis durante 7 días para nuevos usuarios tras la confirmación.',
    required: 'Obligatorio',
    adWillGoLive: 'Tu anuncio se publicará solo después del pago.',
  },
  CZ: {
    ...enTexts,
    pageTitle: 'Přidat reklamu',
    pageSubtitle: 'Vytvořte výraznou reklamu pro více zobrazení a klientů.',
    category: 'Kategorie',
    subcategory: 'Podkategorie',
    chooseCategory: 'Vyberte kategorii',
    chooseSubcategory: 'Vyberte podkategorii',
    title: 'Název reklamy',
    titlePlaceholder: 'Zadejte název reklamy',
    description: 'Popis',
    descriptionPlaceholder: 'Zadejte popis reklamy...',
    badgeText: 'Štítek / promo text',
    badgeNone: 'Žádný',
    badgeDiscount: 'Sleva',
    visibility: 'Viditelnost reklamy',
    visibilityHint: 'Reklama se zobrazí ve vybraném okruhu od místa hledání.',
    radius: 'Okruh',
    perDay: 'za den',
    duration: 'Délka reklamy',
    durationHint: 'Od 10 do 30 dnů',
    days: 'Dny',
    photo: 'Fotky',
    photoHint: 'Přidejte jednu nebo více fotek pro reklamu.',
    addPhoto: 'Přidat fotky',
    photoSource: 'Zdroj souboru',
    gallery: 'Galerie',
    camera: 'Kamera',
    files: 'Soubory',
    layout: 'Zobrazení',
    layoutSingle: '1 fotka',
    layoutGrid: 'Mřížka 2–9',
    summary: 'Shrnutí reklamy',
    total: 'Celkem',
    continueToPayment: 'Pokračovat k platbě',
    done: 'Platba potvrzena. Reklama bude zveřejněna po platbě.',
    choosePaymentMethod: 'Vyberte způsob platby',
    confirmPayment: 'Zaplatit',
    paymentHint: 'Reklama se zveřejní až po potvrzení platby.',
    firstAdBonus:
      'První reklama může být pro nové uživatele zdarma na 7 dní po potvrzení.',
    required: 'Povinné',
    adWillGoLive: 'Reklama bude zveřejněna pouze po platbě.',
  },
  DE: {
    ...enTexts,
    pageTitle: 'Anzeige hinzufügen',
    pageSubtitle: 'Erstelle eine auffällige Anzeige für mehr Aufrufe und Kunden.',
    category: 'Kategorie',
    subcategory: 'Unterkategorie',
    chooseCategory: 'Kategorie wählen',
    chooseSubcategory: 'Unterkategorie wählen',
    title: 'Anzeigentitel',
    titlePlaceholder: 'Anzeigentitel eingeben',
    description: 'Beschreibung',
    descriptionPlaceholder: 'Beschreibung eingeben...',
    badgeText: 'Badge / Promo-Text',
    badgeNone: 'Keine',
    badgeDiscount: 'Rabatt',
    visibility: 'Sichtbarkeit',
    visibilityHint: 'Die Anzeige wird im ausgewählten Radius angezeigt.',
    radius: 'Radius',
    perDay: 'pro Tag',
    duration: 'Dauer',
    durationHint: 'Von 10 bis 30 Tagen',
    days: 'Tage',
    photo: 'Fotos',
    photoHint: 'Füge ein oder mehrere Fotos hinzu.',
    addPhoto: 'Fotos hinzufügen',
    gallery: 'Galerie',
    camera: 'Kamera',
    files: 'Dateien',
    layout: 'Layout',
    layoutSingle: '1 Foto',
    layoutGrid: 'Raster 2–9',
    summary: 'Zusammenfassung',
    total: 'Gesamt',
    continueToPayment: 'Weiter zur Zahlung',
    done: 'Zahlung bestätigt. Die Anzeige wird nach der Zahlung veröffentlicht.',
    choosePaymentMethod: 'Zahlungsmethode wählen',
    confirmPayment: 'Jetzt zahlen',
    paymentHint: 'Veröffentlichung nur nach Zahlungsbestätigung.',
    firstAdBonus:
      'Die erste Anzeige kann für neue Nutzer nach Bestätigung 7 Tage kostenlos sein.',
    required: 'Pflichtfeld',
    adWillGoLive: 'Die Anzeige wird erst nach der Zahlung veröffentlicht.',
  },
  PL: {
    ...enTexts,
    pageTitle: 'Dodaj reklamę',
    pageSubtitle: 'Stwórz wyraźną reklamę, aby zdobyć więcej wyświetleń i klientów.',
    category: 'Kategoria',
    subcategory: 'Podkategoria',
    chooseCategory: 'Wybierz kategorię',
    chooseSubcategory: 'Wybierz podkategorię',
    title: 'Tytuł reklamy',
    titlePlaceholder: 'Wpisz tytuł reklamy',
    description: 'Opis',
    descriptionPlaceholder: 'Wpisz opis reklamy...',
    badgeText: 'Etykieta / promo',
    badgeNone: 'Brak',
    badgeDiscount: 'Zniżka',
    visibility: 'Widoczność reklamy',
    radius: 'Promień',
    perDay: 'za dzień',
    duration: 'Czas trwania',
    durationHint: 'Od 10 do 30 dni',
    days: 'Dni',
    photo: 'Zdjęcia',
    addPhoto: 'Dodaj zdjęcia',
    gallery: 'Galeria',
    camera: 'Kamera',
    files: 'Pliki',
    layout: 'Układ',
    layoutSingle: '1 zdjęcie',
    layoutGrid: 'Siatka 2–9',
    summary: 'Podsumowanie reklamy',
    total: 'Razem',
    continueToPayment: 'Przejdź do płatności',
    done: 'Płatność potwierdzona. Reklama zostanie opublikowana po płatności.',
    choosePaymentMethod: 'Wybierz metodę płatności',
    confirmPayment: 'Zapłać',
    paymentHint: 'Publikacja nastąpi tylko po potwierdzeniu płatności.',
    required: 'Wymagane',
    adWillGoLive: 'Reklama zostanie opublikowana tylko po płatności.',
  },
  IT: {
    ...enTexts,
    pageTitle: 'Aggiungi pubblicità',
    pageSubtitle: 'Crea un annuncio brillante per ottenere più visite e clienti.',
    category: 'Categoria',
    subcategory: 'Sottocategoria',
    chooseCategory: 'Scegli categoria',
    chooseSubcategory: 'Scegli sottocategoria',
    title: 'Titolo annuncio',
    titlePlaceholder: 'Inserisci il titolo',
    description: 'Descrizione',
    descriptionPlaceholder: 'Inserisci descrizione...',
    badgeText: 'Badge / testo promo',
    badgeNone: 'Nessuno',
    badgeDiscount: 'Sconto',
    visibility: 'Visibilità annuncio',
    radius: 'Raggio',
    perDay: 'al giorno',
    duration: 'Durata',
    days: 'Giorni',
    photo: 'Foto',
    addPhoto: 'Aggiungi foto',
    gallery: 'Galleria',
    camera: 'Camera',
    files: 'File',
    layout: 'Layout',
    layoutSingle: '1 foto',
    layoutGrid: 'Griglia 2–9',
    summary: 'Riepilogo',
    total: 'Totale',
    continueToPayment: 'Continua al pagamento',
    done: 'Pagamento confermato. L’annuncio sarà pubblicato dopo il pagamento.',
    choosePaymentMethod: 'Scegli metodo di pagamento',
    confirmPayment: 'Paga ora',
    paymentHint: 'Pubblicazione solo dopo conferma del pagamento.',
    required: 'Obbligatorio',
    adWillGoLive: 'Il tuo annuncio sarà pubblicato solo dopo il pagamento.',
  },
  FR: {
    ...enTexts,
    pageTitle: 'Ajouter une publicité',
    pageSubtitle: 'Créez une publicité visible pour obtenir plus de vues et de clients.',
    category: 'Catégorie',
    subcategory: 'Sous-catégorie',
    chooseCategory: 'Choisir une catégorie',
    chooseSubcategory: 'Choisir une sous-catégorie',
    title: 'Titre de la publicité',
    titlePlaceholder: 'Entrez le titre',
    description: 'Description',
    descriptionPlaceholder: 'Entrez la description...',
    badgeText: 'Badge / texte promo',
    badgeNone: 'Aucun',
    badgeDiscount: 'Réduction',
    visibility: 'Visibilité',
    radius: 'Rayon',
    perDay: 'par jour',
    duration: 'Durée',
    days: 'Jours',
    photo: 'Photos',
    addPhoto: 'Ajouter des photos',
    gallery: 'Galerie',
    camera: 'Caméra',
    files: 'Fichiers',
    layout: 'Affichage',
    layoutSingle: '1 photo',
    layoutGrid: 'Grille 2–9',
    summary: 'Résumé',
    total: 'Total',
    continueToPayment: 'Continuer au paiement',
    done: 'Paiement confirmé. La publicité sera publiée après le paiement.',
    choosePaymentMethod: 'Choisir le moyen de paiement',
    confirmPayment: 'Payer',
    paymentHint: 'Publication uniquement après confirmation du paiement.',
    required: 'Obligatoire',
    adWillGoLive: 'Votre publicité sera publiée uniquement après le paiement.',
  },
  AR: {
    ...enTexts,
    pageTitle: 'إضافة إعلان',
    pageSubtitle: 'أنشئ إعلاناً واضحاً للحصول على مشاهدات وعملاء أكثر.',
    category: 'الفئة',
    subcategory: 'الفئة الفرعية',
    chooseCategory: 'اختر الفئة',
    chooseSubcategory: 'اختر الفئة الفرعية',
    title: 'عنوان الإعلان',
    titlePlaceholder: 'أدخل عنوان الإعلان',
    description: 'الوصف',
    descriptionPlaceholder: 'أدخل وصف الإعلان...',
    badgeText: 'شارة / نص ترويجي',
    badgeNone: 'لا يوجد',
    badgeDiscount: 'خصم',
    visibility: 'ظهور الإعلان',
    radius: 'النطاق',
    perDay: 'في اليوم',
    duration: 'مدة الإعلان',
    days: 'أيام',
    photo: 'الصور',
    addPhoto: 'إضافة صور',
    gallery: 'المعرض',
    camera: 'الكاميرا',
    files: 'الملفات',
    layout: 'طريقة العرض',
    layoutSingle: 'صورة واحدة',
    layoutGrid: 'شبكة 2–9',
    summary: 'ملخص الإعلان',
    total: 'الإجمالي',
    continueToPayment: 'المتابعة للدفع',
    done: 'تم تأكيد الدفع. سيتم نشر الإعلان بعد الدفع.',
    choosePaymentMethod: 'اختر طريقة الدفع',
    confirmPayment: 'ادفع الآن',
    paymentHint: 'يتم النشر فقط بعد تأكيد الدفع.',
    required: 'مطلوب',
    adWillGoLive: 'سيتم نشر إعلانك فقط بعد الدفع.',
  },
};

function getRadiusOptions(language: AppLanguage): RadiusOption[] {
  const kmLabel = language === 'RU' || language === 'UA' ? 'км' : 'km';

  return [
    { id: '10', label: `10 ${kmLabel}`, km: 10, pricePerDay: 1, color: '#2f8c67', bg: '#edf9ef' },
    { id: '50', label: `50 ${kmLabel}`, km: 50, pricePerDay: 2, color: '#c69212', bg: '#fff7d6' },
    { id: '100', label: `100 ${kmLabel}`, km: 100, pricePerDay: 3.5, color: '#e44b4b', bg: '#ffe6e6' },
  ];
}

function getPaymentMethods(language: AppLanguage): PaymentMethod[] {
  if (language === 'RU') {
    return [
      { id: 'card', title: 'Банковская карта', subtitle: 'Visa / Mastercard', icon: '💳' },
      { id: 'wallet', title: 'Баланс Olamep', subtitle: 'Оплата со счёта приложения', icon: '👛' },
      { id: 'paypal', title: 'PayPal', subtitle: 'Быстрая оплата', icon: '🅿️' },
      { id: 'apple-pay', title: 'Apple Pay', subtitle: 'Мгновенная оплата', icon: '' },
      { id: 'google-pay', title: 'Google Pay', subtitle: 'Мгновенная оплата', icon: 'G' },
      { id: 'crypto', title: 'Криптокошелёк', subtitle: 'USDT / USDC', icon: '₿' },
      { id: 'bank', title: 'Банковский перевод', subtitle: 'Ручной перевод', icon: '🏦' },
    ];
  }

  if (language === 'UA') {
    return [
      { id: 'card', title: 'Банківська карта', subtitle: 'Visa / Mastercard', icon: '💳' },
      { id: 'wallet', title: 'Баланс Olamep', subtitle: 'Оплата з балансу додатка', icon: '👛' },
      { id: 'paypal', title: 'PayPal', subtitle: 'Швидка оплата', icon: '🅿️' },
      { id: 'apple-pay', title: 'Apple Pay', subtitle: 'Миттєва оплата', icon: '' },
      { id: 'google-pay', title: 'Google Pay', subtitle: 'Миттєва оплата', icon: 'G' },
      { id: 'crypto', title: 'Криптогаманець', subtitle: 'USDT / USDC', icon: '₿' },
      { id: 'bank', title: 'Банківський переказ', subtitle: 'Ручний переказ', icon: '🏦' },
    ];
  }

  if (language === 'ES') {
    return [
      { id: 'card', title: 'Tarjeta bancaria', subtitle: 'Visa / Mastercard', icon: '💳' },
      { id: 'wallet', title: 'Saldo Olamep', subtitle: 'Pagar desde el saldo', icon: '👛' },
      { id: 'paypal', title: 'PayPal', subtitle: 'Pago rápido', icon: '🅿️' },
      { id: 'apple-pay', title: 'Apple Pay', subtitle: 'Pago instantáneo', icon: '' },
      { id: 'google-pay', title: 'Google Pay', subtitle: 'Pago instantáneo', icon: 'G' },
      { id: 'crypto', title: 'Billetera cripto', subtitle: 'USDT / USDC', icon: '₿' },
      { id: 'bank', title: 'Transferencia bancaria', subtitle: 'Transferencia manual', icon: '🏦' },
    ];
  }

  return [
    { id: 'card', title: 'Bank card', subtitle: 'Visa / Mastercard', icon: '💳' },
    { id: 'wallet', title: 'Olamep balance', subtitle: 'Pay from app balance', icon: '👛' },
    { id: 'paypal', title: 'PayPal', subtitle: 'Fast checkout', icon: '🅿️' },
    { id: 'apple-pay', title: 'Apple Pay', subtitle: 'Instant pay', icon: '' },
    { id: 'google-pay', title: 'Google Pay', subtitle: 'Instant pay', icon: 'G' },
    { id: 'crypto', title: 'Crypto wallet', subtitle: 'USDT / USDC', icon: '₿' },
    { id: 'bank', title: 'Bank transfer', subtitle: 'Manual transfer', icon: '🏦' },
  ];
}

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
  const map: Record<string, Partial<Record<AppLanguage, string>>> = {
    beauty: { EN: 'Beauty', RU: 'Красота', UA: 'Краса', ES: 'Belleza', CZ: 'Krása', DE: 'Beauty', PL: 'Uroda', FR: 'Beauté', IT: 'Beauty', AR: 'الجمال' },
    barber: { EN: 'Barber', RU: 'Барбер', UA: 'Барбер', ES: 'Barbero', CZ: 'Barber', DE: 'Barber', PL: 'Barber', FR: 'Barbier', IT: 'Barber', AR: 'حلاقة' },
    wellness: { EN: 'Wellness', RU: 'Велнес', UA: 'Велнес', ES: 'Bienestar', CZ: 'Wellness', DE: 'Wellness', PL: 'Wellness', FR: 'Bien-être', IT: 'Benessere', AR: 'عافية' },
    home: { EN: 'Home', RU: 'Дом', UA: 'Дім', ES: 'Hogar', CZ: 'Domov', DE: 'Zuhause', PL: 'Dom', FR: 'Maison', IT: 'Casa', AR: 'المنزل' },
    repairs: { EN: 'Repairs', RU: 'Ремонт', UA: 'Ремонт', ES: 'Reparaciones', CZ: 'Opravy', DE: 'Reparaturen', PL: 'Naprawy', FR: 'Réparations', IT: 'Riparazioni', AR: 'إصلاحات' },
    tech: { EN: 'Tech', RU: 'Техника', UA: 'Техніка', ES: 'Tecnología', CZ: 'Technika', DE: 'Technik', PL: 'Technika', FR: 'Tech', IT: 'Tech', AR: 'تقنية' },
    fashion: { EN: 'Fashion', RU: 'Мода', UA: 'Мода', ES: 'Moda', CZ: 'Móda', DE: 'Mode', PL: 'Moda', FR: 'Mode', IT: 'Moda', AR: 'موضة' },
    pets: { EN: 'Pets', RU: 'Питомцы', UA: 'Тварини', ES: 'Mascotas', CZ: 'Mazlíčci', DE: 'Haustiere', PL: 'Zwierzęta', FR: 'Animaux', IT: 'Animali', AR: 'حيوانات' },
    auto: { EN: 'Auto', RU: 'Авто', UA: 'Авто', ES: 'Auto', CZ: 'Auto', DE: 'Auto', PL: 'Auto', FR: 'Auto', IT: 'Auto', AR: 'سيارات' },
    moving: { EN: 'Moving', RU: 'Переезд', UA: 'Переїзд', ES: 'Mudanza', CZ: 'Stěhování', DE: 'Umzug', PL: 'Przeprowadzka', FR: 'Déménagement', IT: 'Trasloco', AR: 'نقل' },
    fitness: { EN: 'Fitness', RU: 'Фитнес', UA: 'Фітнес', ES: 'Fitness', CZ: 'Fitness', DE: 'Fitness', PL: 'Fitness', FR: 'Fitness', IT: 'Fitness', AR: 'لياقة' },
    education: { EN: 'Education', RU: 'Обучение', UA: 'Навчання', ES: 'Educación', CZ: 'Vzdělání', DE: 'Bildung', PL: 'Edukacja', FR: 'Éducation', IT: 'Formazione', AR: 'تعليم' },
    events: { EN: 'Events', RU: 'События', UA: 'Події', ES: 'Eventos', CZ: 'Události', DE: 'Events', PL: 'Wydarzenia', FR: 'Événements', IT: 'Eventi', AR: 'فعاليات' },
    activities: { EN: 'Activities', RU: 'Активности', UA: 'Активності', ES: 'Actividades', CZ: 'Aktivity', DE: 'Aktivitäten', PL: 'Aktywności', FR: 'Activités', IT: 'Attività', AR: 'أنشطة' },
    creative: { EN: 'Creative', RU: 'Креатив', UA: 'Креатив', ES: 'Creativo', CZ: 'Kreativa', DE: 'Kreativ', PL: 'Kreatywne', FR: 'Créatif', IT: 'Creativo', AR: 'إبداعي' },
  };

  return map[categoryId]?.[language] || fallback || categoryId;
}

function translateSubcategory(value: string, language: AppLanguage) {
  const dict: Record<string, Partial<Record<AppLanguage, string>>> = {
    Hair: { RU: 'Волосы', UA: 'Волосся', ES: 'Cabello', CZ: 'Vlasy', DE: 'Haare', PL: 'Włosy', FR: 'Cheveux', IT: 'Capelli', AR: 'الشعر' },
    Nails: { RU: 'Ногти', UA: 'Нігті', ES: 'Uñas', CZ: 'Nehty', DE: 'Nägel', PL: 'Paznokcie', FR: 'Ongles', IT: 'Unghie', AR: 'الأظافر' },
    Makeup: { RU: 'Макияж', UA: 'Макіяж', ES: 'Maquillaje', CZ: 'Make-up', DE: 'Make-up', PL: 'Makijaż', FR: 'Maquillage', IT: 'Make-up', AR: 'مكياج' },
    Massage: { RU: 'Массаж', UA: 'Масаж', ES: 'Masaje', CZ: 'Masáž', DE: 'Massage', PL: 'Masaż', FR: 'Massage', IT: 'Massaggio', AR: 'مساج' },
    Cleaning: { RU: 'Уборка', UA: 'Прибирання', ES: 'Limpieza', CZ: 'Úklid', DE: 'Reinigung', PL: 'Sprzątanie', FR: 'Nettoyage', IT: 'Pulizia', AR: 'تنظيف' },
    'Phone Repair': { RU: 'Ремонт телефона', UA: 'Ремонт телефону', ES: 'Reparación de teléfono', CZ: 'Oprava telefonu', DE: 'Handyreparatur', PL: 'Naprawa telefonu', FR: 'Réparation téléphone', IT: 'Riparazione telefono', AR: 'إصلاح الهاتف' },
    'Computer Repair': { RU: 'Ремонт компьютера', UA: 'Ремонт компʼютера', ES: 'Reparación de ordenador', CZ: 'Oprava počítače', DE: 'Computerreparatur', PL: 'Naprawa komputera', FR: 'Réparation ordinateur', IT: 'Riparazione computer', AR: 'إصلاح الكمبيوتر' },
    'Dog Walking': { RU: 'Выгул собак', UA: 'Вигул собак', ES: 'Paseo de perros', CZ: 'Venčení psů', DE: 'Gassi-Service', PL: 'Wyprowadzanie psów', FR: 'Promenade de chiens', IT: 'Passeggiata cani', AR: 'تمشية الكلاب' },
    'Pet Sitting': { RU: 'Передержка питомцев', UA: 'Перетримка тварин', ES: 'Cuidado de mascotas', CZ: 'Hlídání mazlíčků', DE: 'Tiersitting', PL: 'Opieka nad zwierzętami', FR: 'Garde d’animaux', IT: 'Pet sitting', AR: 'رعاية الحيوانات' },
    'Car Wash': { RU: 'Мойка авто', UA: 'Мийка авто', ES: 'Lavado de coche', CZ: 'Mytí auta', DE: 'Autowäsche', PL: 'Mycie auta', FR: 'Lavage auto', IT: 'Lavaggio auto', AR: 'غسيل السيارة' },
    Courier: { RU: 'Курьер', UA: 'Курʼєр', ES: 'Mensajería', CZ: 'Kurýr', DE: 'Kurier', PL: 'Kurier', FR: 'Coursier', IT: 'Corriere', AR: 'توصيل' },
    Yoga: { RU: 'Йога', UA: 'Йога', ES: 'Yoga', CZ: 'Jóga', DE: 'Yoga', PL: 'Joga', FR: 'Yoga', IT: 'Yoga', AR: 'يوغا' },
    Tutoring: { RU: 'Репетиторство', UA: 'Репетиторство', ES: 'Tutoría', CZ: 'Doučování', DE: 'Nachhilfe', PL: 'Korepetycje', FR: 'Tutorat', IT: 'Tutoraggio', AR: 'دروس خصوصية' },
    Photography: { RU: 'Фотография', UA: 'Фотографія', ES: 'Fotografía', CZ: 'Fotografie', DE: 'Fotografie', PL: 'Fotografia', FR: 'Photographie', IT: 'Fotografia', AR: 'تصوير' },
    Other: { RU: 'Другое', UA: 'Інше', ES: 'Otro', CZ: 'Jiné', DE: 'Andere', PL: 'Inne', FR: 'Autre', IT: 'Altro', AR: 'أخرى' },
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

      if (miniVideo?.preview) {
        URL.revokeObjectURL(miniVideo.preview);
      }
    };
  }, [photos, miniVideo]);

  const text = textByLanguage[language] || textByLanguage.EN;
  const radiusOptions = getRadiusOptions(language);
  const paymentMethods = getPaymentMethods(language);
  const selectedRadius = radiusOptions.find((item) => item.id === radius) || radiusOptions[0];

  const localizedCategories = useMemo(() => {
    return categories.map((item) => ({
      ...item,
      localizedLabel: translateCategoryLabel(item.id, language, item.label),
      localizedShortLabel: translateCategoryLabel(item.id, language, item.shortLabel || item.label),
      localizedSubcategories: item.subcategories.map((sub) => ({
        value: sub,
        label: translateSubcategory(sub, language),
      })),
    }));
  }, [language]);

  const currentCategory = localizedCategories.find((item) => item.id === categoryId) || null;
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

    const remainingSlots = Math.max(0, MAX_PHOTOS - photos.length);
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
              borderRadius: 26,
              border: '2px solid #111111',
              background: '#fff7d6',
              padding: '12px 14px',
              marginBottom: 16,
              fontSize: 14,
              fontWeight: 900,
              color: '#17130f',
              lineHeight: 1.4,
            }}
          >
            {text.adWillGoLive}
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
                  {text.maxPhotos}
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
                    gridTemplateColumns: layout === 'single' ? '1fr' : '1fr 1fr',
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
                    {title || text.titlePlaceholder}
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
                  {description || text.descriptionPlaceholder}
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
              <div>
                {text.category}: {currentCategory?.localizedLabel || '—'}
              </div>

              <div>
                {text.subcategory}:{' '}
                {subcategoryOptions.find((item) => item.value === subcategory)?.label || '—'}
              </div>

              <div>
                {text.radius}: {selectedRadius.label}
              </div>

              <div>
                {text.duration}: {days}
              </div>

              <div>
                £{selectedRadius.pricePerDay} / {text.perDay}
              </div>

              <div>
                {text.photosCount}: {photos.length}
              </div>

              <div>
                {text.miniVideo}: {miniVideo ? '1' : '0'}
              </div>

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
              maxHeight: 'calc(100vh - 40px)',
              overflowY: 'auto',
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
