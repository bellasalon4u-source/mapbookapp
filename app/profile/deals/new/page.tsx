'use client';

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
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
  enterCategory: string;
  enterSubcategory: string;
  enterDiscountTitle: string;
  enterDiscountPercent: string;
  enterDescription: string;
  addPhotoAlert: string;
  close: string;
  paymentHint: string;
  summary: string;
  livePreview: string;
  sponsored: string;
  openDeal: string;
  paymentRequired: string;
};

type DealPhotoState = {
  name: string;
  preview: string;
};

const baseTexts: DealTexts = {
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
  done: 'Payment confirmed. Day deal will be published after payment.',
  ok: 'OK',
  publishDay1: 'Publish deal for 1 day',
  publishDays: 'Publish deal for {days} days',
  day: 'day',
  day2to4: 'days',
  days: 'days',
  enterCategory: 'Choose category',
  enterSubcategory: 'Choose subcategory',
  enterDiscountTitle: 'Enter deal title',
  enterDiscountPercent: 'Enter discount size',
  enterDescription: 'Enter description',
  addPhotoAlert: 'Add photo',
  close: 'Close',
  paymentHint: 'The day deal is published only after payment confirmation.',
  summary: 'Day deal summary',
  livePreview: 'Live preview',
  sponsored: 'Deal of the day',
  openDeal: 'Open deal',
  paymentRequired: 'Publication is available only after payment.',
};

const textOverrides: Partial<Record<AppLanguage, Partial<DealTexts>>> = {
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
    photoHint: 'Добавьте только 1 фото для скидки дня.',
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
    done: 'Оплата подтверждена. Скидка дня будет опубликована после оплаты.',
    ok: 'OK',
    publishDay1: 'Опубликовать скидку на 1 день',
    publishDays: 'Опубликовать скидку на {days} дней',
    day: 'день',
    day2to4: 'дня',
    days: 'дней',
    enterCategory: 'Выберите категорию',
    enterSubcategory: 'Выберите подкатегорию',
    enterDiscountTitle: 'Введите название скидки',
    enterDiscountPercent: 'Введите размер скидки',
    enterDescription: 'Введите описание',
    addPhotoAlert: 'Добавьте фото',
    close: 'Закрыть',
    paymentHint: 'Скидка дня публикуется только после подтверждения оплаты.',
    summary: 'Итог скидки дня',
    livePreview: 'Предварительный просмотр',
    sponsored: 'Скидка дня',
    openDeal: 'Открыть скидку',
    paymentRequired: 'Публикация доступна только после оплаты.',
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
    photoHint: 'Додайте тільки 1 фото для знижки дня.',
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
    done: 'Оплата підтверджена. Знижка дня буде опублікована після оплати.',
    ok: 'OK',
    publishDay1: 'Опублікувати знижку на 1 день',
    publishDays: 'Опублікувати знижку на {days} днів',
    day: 'день',
    day2to4: 'дні',
    days: 'днів',
    enterCategory: 'Оберіть категорію',
    enterSubcategory: 'Оберіть підкатегорію',
    enterDiscountTitle: 'Введіть назву знижки',
    enterDiscountPercent: 'Введіть розмір знижки',
    enterDescription: 'Введіть опис',
    addPhotoAlert: 'Додайте фото',
    close: 'Закрити',
    paymentHint: 'Знижка дня публікується тільки після підтвердження оплати.',
    summary: 'Підсумок знижки дня',
    livePreview: 'Попередній перегляд',
    sponsored: 'Знижка дня',
    openDeal: 'Відкрити знижку',
    paymentRequired: 'Публікація доступна тільки після оплати.',
  },
  ES: {
    pageTitle: 'Añadir descuento del día',
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
    photoHint: 'Añade solo 1 foto para el descuento del día.',
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
    done: 'Pago confirmado. El descuento se publicará después del pago.',
    ok: 'OK',
    publishDay1: 'Publicar descuento por 1 día',
    publishDays: 'Publicar descuento por {days} días',
    day: 'día',
    day2to4: 'días',
    days: 'días',
    enterCategory: 'Elige categoría',
    enterSubcategory: 'Elige subcategoría',
    enterDiscountTitle: 'Introduce el título del descuento',
    enterDiscountPercent: 'Introduce el tamaño del descuento',
    enterDescription: 'Introduce la descripción',
    addPhotoAlert: 'Añade una foto',
    close: 'Cerrar',
    paymentHint: 'La oferta se publica solo después de confirmar el pago.',
    summary: 'Resumen del descuento',
    livePreview: 'Vista previa',
    sponsored: 'Descuento del día',
    openDeal: 'Abrir descuento',
    paymentRequired: 'La publicación está disponible solo después del pago.',
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
    photoHint: 'Přidejte pouze 1 fotku pro slevu dne.',
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
    done: 'Platba potvrzena. Sleva dne bude publikována po platbě.',
    ok: 'OK',
    publishDay1: 'Publikovat slevu na 1 den',
    publishDays: 'Publikovat slevu na {days} dní',
    day: 'den',
    day2to4: 'dny',
    days: 'dní',
    enterCategory: 'Vyberte kategorii',
    enterSubcategory: 'Vyberte podkategorii',
    enterDiscountTitle: 'Zadejte název slevy',
    enterDiscountPercent: 'Zadejte výši slevy',
    enterDescription: 'Zadejte popis',
    addPhotoAlert: 'Přidejte fotku',
    close: 'Zavřít',
    paymentHint: 'Sleva dne bude publikována až po potvrzení platby.',
    summary: 'Shrnutí slevy dne',
    livePreview: 'Náhled',
    sponsored: 'Sleva dne',
    openDeal: 'Otevřít slevu',
    paymentRequired: 'Publikace je dostupná pouze po platbě.',
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
    photoHint: 'Fügen Sie nur 1 Foto für den Tagesrabatt hinzu.',
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
    done: 'Zahlung bestätigt. Der Tagesrabatt wird nach der Zahlung veröffentlicht.',
    ok: 'OK',
    publishDay1: 'Rabatt für 1 Tag veröffentlichen',
    publishDays: 'Rabatt für {days} Tage veröffentlichen',
    day: 'Tag',
    day2to4: 'Tage',
    days: 'Tage',
    enterCategory: 'Kategorie wählen',
    enterSubcategory: 'Unterkategorie wählen',
    enterDiscountTitle: 'Rabatttitel eingeben',
    enterDiscountPercent: 'Rabattgröße eingeben',
    enterDescription: 'Beschreibung eingeben',
    addPhotoAlert: 'Foto hinzufügen',
    close: 'Schließen',
    paymentHint: 'Der Tagesrabatt wird erst nach Zahlungsbestätigung veröffentlicht.',
    summary: 'Tagesrabatt Übersicht',
    livePreview: 'Vorschau',
    sponsored: 'Tagesrabatt',
    openDeal: 'Rabatt öffnen',
    paymentRequired: 'Veröffentlichung nur nach Zahlung möglich.',
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
    photoHint: 'Dodaj tylko 1 zdjęcie do zniżki dnia.',
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
    done: 'Płatność potwierdzona. Zniżka dnia zostanie opublikowana po płatności.',
    ok: 'OK',
    publishDay1: 'Opublikuj zniżkę na 1 dzień',
    publishDays: 'Opublikuj zniżkę na {days} dni',
    day: 'dzień',
    day2to4: 'dni',
    days: 'dni',
    enterCategory: 'Wybierz kategorię',
    enterSubcategory: 'Wybierz podkategorię',
    enterDiscountTitle: 'Wpisz nazwę zniżki',
    enterDiscountPercent: 'Wpisz wysokość zniżki',
    enterDescription: 'Wpisz opis',
    addPhotoAlert: 'Dodaj zdjęcie',
    close: 'Zamknij',
    paymentHint: 'Zniżka dnia zostanie opublikowana dopiero po potwierdzeniu płatności.',
    summary: 'Podsumowanie zniżki dnia',
    livePreview: 'Podgląd',
    sponsored: 'Zniżka dnia',
    openDeal: 'Otwórz zniżkę',
    paymentRequired: 'Publikacja jest dostępna tylko po płatności.',
  },
  IT: {
    pageTitle: 'Aggiungi offerta del giorno',
    pageSubtitle: 'Crea una promozione speciale per oggi o più giorni.',
    category: 'Categoria',
    subcategory: 'Sottocategoria',
    chooseCategory: 'Scegli categoria',
    chooseSubcategory: 'Scegli sottocategoria',
    discountTitle: 'Titolo offerta',
    discountTitlePlaceholder: 'Inserisci titolo offerta',
    discountPercent: 'Sconto',
    onlyToday: 'Offerta a tempo limitato',
    description: 'Descrizione',
    descriptionPlaceholder: 'Inserisci descrizione...',
    chooseDays: 'Scegli numero di giorni',
    photo: 'Foto',
    photoHint: 'Aggiungi 1 foto per l’offerta del giorno.',
    addPhoto: 'Aggiungi foto',
    replacePhoto: 'Sostituisci',
    photoAdded: 'Foto aggiunta',
    photoSource: 'Fonte foto',
    gallery: 'Galleria',
    camera: 'Camera',
    files: 'File',
    totalToPay: 'Totale da pagare',
    choosePaymentMethod: 'Scegli metodo di pagamento',
    paymentMethodsHint: 'Seleziona come vuoi pagare',
    selected: 'Selezionato',
    cancel: 'Annulla',
    pay: 'Paga',
    done: 'Pagamento confermato. L’offerta verrà pubblicata dopo il pagamento.',
    ok: 'OK',
    publishDay1: 'Pubblica offerta per 1 giorno',
    publishDays: 'Pubblica offerta per {days} giorni',
    day: 'giorno',
    day2to4: 'giorni',
    days: 'giorni',
    enterCategory: 'Scegli categoria',
    enterSubcategory: 'Scegli sottocategoria',
    enterDiscountTitle: 'Inserisci titolo offerta',
    enterDiscountPercent: 'Inserisci sconto',
    enterDescription: 'Inserisci descrizione',
    addPhotoAlert: 'Aggiungi foto',
    close: 'Chiudi',
    paymentHint: 'L’offerta viene pubblicata solo dopo il pagamento.',
    summary: 'Riepilogo offerta',
    livePreview: 'Anteprima',
    sponsored: 'Offerta del giorno',
    openDeal: 'Apri offerta',
    paymentRequired: 'La pubblicazione è disponibile solo dopo il pagamento.',
  },
  FR: {
    pageTitle: 'Ajouter une offre du jour',
    pageSubtitle: 'Créez une offre spéciale pour aujourd’hui ou plusieurs jours.',
    category: 'Catégorie',
    subcategory: 'Sous-catégorie',
    chooseCategory: 'Choisir catégorie',
    chooseSubcategory: 'Choisir sous-catégorie',
    discountTitle: 'Titre de l’offre',
    discountTitlePlaceholder: 'Entrez le titre',
    discountPercent: 'Réduction',
    onlyToday: 'Offre limitée',
    description: 'Description',
    descriptionPlaceholder: 'Entrez la description...',
    chooseDays: 'Choisir le nombre de jours',
    photo: 'Photo',
    photoHint: 'Ajoutez 1 photo pour l’offre du jour.',
    addPhoto: 'Ajouter photo',
    replacePhoto: 'Remplacer',
    photoAdded: 'Photo ajoutée',
    photoSource: 'Source photo',
    gallery: 'Galerie',
    camera: 'Caméra',
    files: 'Fichiers',
    totalToPay: 'Total à payer',
    choosePaymentMethod: 'Choisir le paiement',
    paymentMethodsHint: 'Sélectionnez votre mode de paiement',
    selected: 'Sélectionné',
    cancel: 'Annuler',
    pay: 'Payer',
    done: 'Paiement confirmé. L’offre sera publiée après paiement.',
    ok: 'OK',
    publishDay1: 'Publier l’offre pour 1 jour',
    publishDays: 'Publier l’offre pour {days} jours',
    day: 'jour',
    day2to4: 'jours',
    days: 'jours',
    enterCategory: 'Choisir catégorie',
    enterSubcategory: 'Choisir sous-catégorie',
    enterDiscountTitle: 'Entrez le titre',
    enterDiscountPercent: 'Entrez la réduction',
    enterDescription: 'Entrez la description',
    addPhotoAlert: 'Ajoutez une photo',
    close: 'Fermer',
    paymentHint: 'L’offre est publiée seulement après confirmation du paiement.',
    summary: 'Résumé de l’offre',
    livePreview: 'Aperçu',
    sponsored: 'Offre du jour',
    openDeal: 'Ouvrir l’offre',
    paymentRequired: 'La publication est disponible uniquement après paiement.',
  },
  AR: {
    pageTitle: 'إضافة عرض اليوم',
    pageSubtitle: 'أنشئ عرضًا خاصًا لليوم أو لعدة أيام.',
    category: 'الفئة',
    subcategory: 'الفئة الفرعية',
    chooseCategory: 'اختر الفئة',
    chooseSubcategory: 'اختر الفئة الفرعية',
    discountTitle: 'عنوان العرض',
    discountTitlePlaceholder: 'أدخل عنوان العرض',
    discountPercent: 'قيمة الخصم',
    onlyToday: 'عرض محدود',
    description: 'الوصف',
    descriptionPlaceholder: 'أدخل الوصف...',
    chooseDays: 'اختر عدد الأيام',
    photo: 'صورة',
    photoHint: 'أضف صورة واحدة لعرض اليوم.',
    addPhoto: 'إضافة صورة',
    replacePhoto: 'استبدال',
    photoAdded: 'تمت إضافة الصورة',
    photoSource: 'مصدر الصورة',
    gallery: 'المعرض',
    camera: 'الكاميرا',
    files: 'الملفات',
    totalToPay: 'الإجمالي للدفع',
    choosePaymentMethod: 'اختر طريقة الدفع',
    paymentMethodsHint: 'اختر كيف تريد الدفع',
    selected: 'مختار',
    cancel: 'إلغاء',
    pay: 'دفع',
    done: 'تم تأكيد الدفع. سيتم نشر العرض بعد الدفع.',
    ok: 'موافق',
    publishDay1: 'نشر العرض ليوم واحد',
    publishDays: 'نشر العرض لمدة {days} أيام',
    day: 'يوم',
    day2to4: 'أيام',
    days: 'أيام',
    enterCategory: 'اختر الفئة',
    enterSubcategory: 'اختر الفئة الفرعية',
    enterDiscountTitle: 'أدخل عنوان العرض',
    enterDiscountPercent: 'أدخل قيمة الخصم',
    enterDescription: 'أدخل الوصف',
    addPhotoAlert: 'أضف صورة',
    close: 'إغلاق',
    paymentHint: 'يتم نشر عرض اليوم فقط بعد تأكيد الدفع.',
    summary: 'ملخص عرض اليوم',
    livePreview: 'معاينة',
    sponsored: 'عرض اليوم',
    openDeal: 'فتح العرض',
    paymentRequired: 'النشر متاح فقط بعد الدفع.',
  },
};

function getTexts(language: AppLanguage): DealTexts {
  return {
    ...baseTexts,
    ...(textOverrides[language] || {}),
  };
}

function getPaymentMethods(language: AppLanguage): PaymentSheetMethod[] {
  const common = {
    card: { icon: '💳', accentBg: '#edf4ff', accentColor: '#2f7cf6' },
    paypal: { icon: '🅿️', accentBg: '#eef5ff', accentColor: '#2563eb' },
    apple: { icon: '', accentBg: '#f4efe8', accentColor: '#17130f' },
    google: { icon: '🟢', accentBg: '#eef9f1', accentColor: '#2fa35a' },
    wallet: { icon: '👛', accentBg: '#fff1f7', accentColor: '#ff4fa0' },
    crypto: { icon: '₿', accentBg: '#fff6e8', accentColor: '#d68612' },
    bank: { icon: '🏦', accentBg: '#f3efff', accentColor: '#7a5af8' },
  };

  if (language === 'RU') {
    return [
      { id: 'card', title: 'Банковская карта', subtitle: 'Visa / Mastercard', ...common.card },
      { id: 'paypal', title: 'PayPal', subtitle: 'Быстрая оплата', ...common.paypal },
      { id: 'apple-pay', title: 'Apple Pay', subtitle: 'Быстрая оплата', ...common.apple },
      { id: 'google-pay', title: 'Google Pay', subtitle: 'Оплата в 1 касание', ...common.google },
      { id: 'wallet', title: 'OlaCash', subtitle: 'Списать с кошелька', ...common.wallet },
      { id: 'crypto', title: 'Криптокошелёк', subtitle: 'USDT / USDC', ...common.crypto },
      { id: 'bank', title: 'Банковский перевод', subtitle: 'Ручной перевод', ...common.bank },
    ];
  }

  return [
    { id: 'card', title: 'Bank card', subtitle: 'Visa / Mastercard', ...common.card },
    { id: 'paypal', title: 'PayPal', subtitle: 'Fast payment', ...common.paypal },
    { id: 'apple-pay', title: 'Apple Pay', subtitle: 'Express checkout', ...common.apple },
    { id: 'google-pay', title: 'Google Pay', subtitle: 'One-tap payment', ...common.google },
    { id: 'wallet', title: 'OlaCash', subtitle: 'Charge from wallet', ...common.wallet },
    { id: 'crypto', title: 'Crypto wallet', subtitle: 'USDT / USDC', ...common.crypto },
    { id: 'bank', title: 'Bank transfer', subtitle: 'Manual transfer', ...common.bank },
  ];
}

function getDayWord(days: number, language: AppLanguage, text: DealTexts) {
  if (language === 'RU' || language === 'UA') {
    if (days % 10 === 1 && days % 100 !== 11) return text.day;
    if ([2, 3, 4].includes(days % 10) && ![12, 13, 14].includes(days % 100)) {
      return text.day2to4;
    }
    return text.days;
  }

  return days === 1 ? text.day : text.days;
}

function translateCategoryLabel(categoryId: string, language: AppLanguage, fallback?: string) {
  const map: Record<string, Partial<Record<AppLanguage, string>>> = {
    beauty: {
      EN: 'Beauty',
      RU: 'Красота',
      UA: 'Краса',
      ES: 'Belleza',
      CZ: 'Krása',
      DE: 'Beauty',
      PL: 'Uroda',
      IT: 'Beauty',
      FR: 'Beauté',
      AR: 'الجمال',
    },
    barber: {
      EN: 'Barber',
      RU: 'Барбер',
      UA: 'Барбер',
      ES: 'Barbero',
      CZ: 'Barber',
      DE: 'Barber',
      PL: 'Barber',
      IT: 'Barber',
      FR: 'Barbier',
      AR: 'حلاقة',
    },
    wellness: {
      EN: 'Wellness',
      RU: 'Велнес',
      UA: 'Велнес',
      ES: 'Bienestar',
      CZ: 'Wellness',
      DE: 'Wellness',
      PL: 'Wellness',
      IT: 'Benessere',
      FR: 'Bien-être',
      AR: 'عافية',
    },
    home: {
      EN: 'Home',
      RU: 'Дом',
      UA: 'Дім',
      ES: 'Hogar',
      CZ: 'Domov',
      DE: 'Zuhause',
      PL: 'Dom',
      IT: 'Casa',
      FR: 'Maison',
      AR: 'المنزل',
    },
    repairs: {
      EN: 'Repairs',
      RU: 'Ремонт',
      UA: 'Ремонт',
      ES: 'Reparaciones',
      CZ: 'Opravy',
      DE: 'Reparaturen',
      PL: 'Naprawy',
      IT: 'Riparazioni',
      FR: 'Réparations',
      AR: 'إصلاحات',
    },
    tech: {
      EN: 'Tech',
      RU: 'Техника',
      UA: 'Техніка',
      ES: 'Tecnología',
      CZ: 'Technika',
      DE: 'Technik',
      PL: 'Technika',
      IT: 'Tech',
      FR: 'Tech',
      AR: 'تقنية',
    },
    fashion: {
      EN: 'Fashion',
      RU: 'Мода',
      UA: 'Мода',
      ES: 'Moda',
      CZ: 'Móda',
      DE: 'Mode',
      PL: 'Moda',
      IT: 'Moda',
      FR: 'Mode',
      AR: 'موضة',
    },
    pets: {
      EN: 'Pets',
      RU: 'Питомцы',
      UA: 'Тварини',
      ES: 'Mascotas',
      CZ: 'Mazlíčci',
      DE: 'Haustiere',
      PL: 'Zwierzęta',
      IT: 'Animali',
      FR: 'Animaux',
      AR: 'حيوانات',
    },
    auto: {
      EN: 'Auto',
      RU: 'Авто',
      UA: 'Авто',
      ES: 'Auto',
      CZ: 'Auto',
      DE: 'Auto',
      PL: 'Auto',
      IT: 'Auto',
      FR: 'Auto',
      AR: 'سيارات',
    },
    moving: {
      EN: 'Moving',
      RU: 'Переезд',
      UA: 'Переїзд',
      ES: 'Mudanza',
      CZ: 'Stěhování',
      DE: 'Umzug',
      PL: 'Przeprowadzka',
      IT: 'Trasloco',
      FR: 'Déménagement',
      AR: 'نقل',
    },
    fitness: {
      EN: 'Fitness',
      RU: 'Фитнес',
      UA: 'Фітнес',
      ES: 'Fitness',
      CZ: 'Fitness',
      DE: 'Fitness',
      PL: 'Fitness',
      IT: 'Fitness',
      FR: 'Fitness',
      AR: 'لياقة',
    },
    education: {
      EN: 'Education',
      RU: 'Обучение',
      UA: 'Навчання',
      ES: 'Educación',
      CZ: 'Vzdělání',
      DE: 'Bildung',
      PL: 'Edukacja',
      IT: 'Formazione',
      FR: 'Éducation',
      AR: 'تعليم',
    },
    events: {
      EN: 'Events',
      RU: 'События',
      UA: 'Події',
      ES: 'Eventos',
      CZ: 'Události',
      DE: 'Events',
      PL: 'Wydarzenia',
      IT: 'Eventi',
      FR: 'Événements',
      AR: 'فعاليات',
    },
    activities: {
      EN: 'Activities',
      RU: 'Активности',
      UA: 'Активності',
      ES: 'Actividades',
      CZ: 'Aktivity',
      DE: 'Aktivitäten',
      PL: 'Aktywności',
      IT: 'Attività',
      FR: 'Activités',
      AR: 'أنشطة',
    },
    creative: {
      EN: 'Creative',
      RU: 'Креатив',
      UA: 'Креатив',
      ES: 'Creativo',
      CZ: 'Kreativa',
      DE: 'Kreativ',
      PL: 'Kreatywne',
      IT: 'Creativo',
      FR: 'Créatif',
      AR: 'إبداعي',
    },
    other: {
      EN: 'Other',
      RU: 'Остальное',
      UA: 'Інше',
      ES: 'Otro',
      CZ: 'Ostatní',
      DE: 'Andere',
      PL: 'Inne',
      IT: 'Altro',
      FR: 'Autre',
      AR: 'أخرى',
    },
  };

  return map[categoryId]?.[language] || fallback || categoryId;
}

function translateSubcategory(value: string, language: AppLanguage) {
  const dict: Record<string, Partial<Record<AppLanguage, string>>> = {
    Hair: {
      RU: 'Волосы',
      UA: 'Волосся',
      ES: 'Cabello',
      CZ: 'Vlasy',
      DE: 'Haare',
      PL: 'Włosy',
      IT: 'Capelli',
      FR: 'Cheveux',
      AR: 'الشعر',
    },
    Nails: {
      RU: 'Ногти',
      UA: 'Нігті',
      ES: 'Uñas',
      CZ: 'Nehty',
      DE: 'Nägel',
      PL: 'Paznokcie',
      IT: 'Unghie',
      FR: 'Ongles',
      AR: 'الأظافر',
    },
    Makeup: {
      RU: 'Макияж',
      UA: 'Макіяж',
      ES: 'Maquillaje',
      CZ: 'Make-up',
      DE: 'Make-up',
      PL: 'Makijaż',
      IT: 'Make-up',
      FR: 'Maquillage',
      AR: 'مكياج',
    },
    Massage: {
      RU: 'Массаж',
      UA: 'Масаж',
      ES: 'Masaje',
      CZ: 'Masáž',
      DE: 'Massage',
      PL: 'Masaż',
      IT: 'Massaggio',
      FR: 'Massage',
      AR: 'مساج',
    },
    Cleaning: {
      RU: 'Уборка',
      UA: 'Прибирання',
      ES: 'Limpieza',
      CZ: 'Úklid',
      DE: 'Reinigung',
      PL: 'Sprzątanie',
      IT: 'Pulizia',
      FR: 'Nettoyage',
      AR: 'تنظيف',
    },
    'Phone Repair': {
      RU: 'Ремонт телефона',
      UA: 'Ремонт телефону',
      ES: 'Reparación de teléfono',
      CZ: 'Oprava telefonu',
      DE: 'Handyreparatur',
      PL: 'Naprawa telefonu',
      IT: 'Riparazione telefono',
      FR: 'Réparation téléphone',
      AR: 'إصلاح الهاتف',
    },
    'Computer Repair': {
      RU: 'Ремонт компьютера',
      UA: 'Ремонт компʼютера',
      ES: 'Reparación de ordenador',
      CZ: 'Oprava počítače',
      DE: 'Computerreparatur',
      PL: 'Naprawa komputera',
      IT: 'Riparazione computer',
      FR: 'Réparation ordinateur',
      AR: 'إصلاح الكمبيوتر',
    },
    'Dog Walking': {
      RU: 'Выгул собак',
      UA: 'Вигул собак',
      ES: 'Paseo de perros',
      CZ: 'Venčení psů',
      DE: 'Gassi-Service',
      PL: 'Wyprowadzanie psów',
      IT: 'Passeggiata cani',
      FR: 'Promenade de chiens',
      AR: 'تمشية الكلاب',
    },
    'Pet Sitting': {
      RU: 'Передержка питомцев',
      UA: 'Перетримка тварин',
      ES: 'Cuidado de mascotas',
      CZ: 'Hlídání mazlíčků',
      DE: 'Tiersitting',
      PL: 'Opieka nad zwierzętami',
      IT: 'Pet sitting',
      FR: 'Garde d’animaux',
      AR: 'رعاية الحيوانات',
    },
    'Car Wash': {
      RU: 'Мойка авто',
      UA: 'Мийка авто',
      ES: 'Lavado de coche',
      CZ: 'Mytí auta',
      DE: 'Autowäsche',
      PL: 'Mycie auta',
      IT: 'Lavaggio auto',
      FR: 'Lavage auto',
      AR: 'غسيل السيارة',
    },
    Courier: {
      RU: 'Курьер',
      UA: 'Курʼєр',
      ES: 'Mensajería',
      CZ: 'Kurýr',
      DE: 'Kurier',
      PL: 'Kurier',
      IT: 'Corriere',
      FR: 'Coursier',
      AR: 'توصيل',
    },
    Yoga: {
      RU: 'Йога',
      UA: 'Йога',
      ES: 'Yoga',
      CZ: 'Jóga',
      DE: 'Yoga',
      PL: 'Joga',
      IT: 'Yoga',
      FR: 'Yoga',
      AR: 'يوغا',
    },
    Tutoring: {
      RU: 'Репетиторство',
      UA: 'Репетиторство',
      ES: 'Tutoría',
      CZ: 'Doučování',
      DE: 'Nachhilfe',
      PL: 'Korepetycje',
      IT: 'Tutoraggio',
      FR: 'Tutorat',
      AR: 'دروس خصوصية',
    },
    Photography: {
      RU: 'Фотография',
      UA: 'Фотографія',
      ES: 'Fotografía',
      CZ: 'Fotografie',
      DE: 'Fotografie',
      PL: 'Fotografia',
      IT: 'Fotografia',
      FR: 'Photographie',
      AR: 'تصوير',
    },
    Tattoo: {
      RU: 'Тату',
      UA: 'Тату',
      ES: 'Tatuaje',
      CZ: 'Tetování',
      DE: 'Tattoo',
      PL: 'Tatuaż',
      IT: 'Tatuaggio',
      FR: 'Tatouage',
      AR: 'وشم',
    },
    Piercing: {
      RU: 'Пирсинг',
      UA: 'Пірсинг',
      ES: 'Piercing',
      CZ: 'Piercing',
      DE: 'Piercing',
      PL: 'Piercing',
      IT: 'Piercing',
      FR: 'Piercing',
      AR: 'ثقب',
    },
    'Tattoo removal': {
      RU: 'Удаление тату',
      UA: 'Видалення тату',
      ES: 'Eliminación de tatuajes',
      CZ: 'Odstranění tetování',
      DE: 'Tattooentfernung',
      PL: 'Usuwanie tatuażu',
      IT: 'Rimozione tatuaggi',
      FR: 'Détatouage',
      AR: 'إزالة الوشم',
    },
    Other: {
      RU: 'Остальное',
      UA: 'Інше',
      ES: 'Otro',
      CZ: 'Ostatní',
      DE: 'Andere',
      PL: 'Inne',
      IT: 'Altro',
      FR: 'Autre',
      AR: 'أخرى',
    },
  };

  return dict[value]?.[language] || value;
}

function DealPhotoPreview({
  src,
  alt,
  height,
}: {
  src: string;
  alt: string;
  height: number;
}) {
  return (
    <img
      src={src}
      alt={alt}
      style={{
        width: '100%',
        height,
        objectFit: 'cover',
        display: 'block',
      }}
    />
  );
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

  const text = useMemo(() => getTexts(language), [language]);
  const paymentMethods = useMemo(() => getPaymentMethods(language), [language]);
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
    });

    event.target.value = '';
    setShowPhotoSourceMenu(false);
  };

  const handleRemovePhoto = () => {
    if (photo?.preview) {
      URL.revokeObjectURL(photo.preview);
    }

    setPhoto(null);
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
            {text.paymentRequired}
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
                  color: '#ef3e36',
                  outline: 'none',
                  boxSizing: 'border-box',
                  textAlign: 'center',
                }}
              />

              <div
                style={{
                  height: 58,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 22,
                  fontWeight: 900,
                  color: '#ef3e36',
                }}
              >
                %
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
                    JPG / PNG / WEBP · 1 photo
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
                  <DealPhotoPreview
                    src={photo.preview}
                    alt={photo.name || 'deal-photo'}
                    height={220}
                  />

                  <div
                    style={{
                      position: 'absolute',
                      top: 10,
                      right: 10,
                      display: 'flex',
                      gap: 8,
                      zIndex: 5,
                    }}
                  >
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: 999,
                        border: '2px solid #111111',
                        background: '#ffffff',
                        color: '#17130f',
                        fontSize: 22,
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
                    display: 'grid',
                    gridTemplateColumns: '1fr auto',
                    alignItems: 'center',
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
                  height: 280,
                  background: '#ebe6da',
                  overflow: 'hidden',
                }}
              >
                {photo ? (
                  <DealPhotoPreview
                    src={photo.preview}
                    alt={photo.name || 'deal-preview'}
                    height={280}
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
                    {text.photo}
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
                    zIndex: 5,
                    pointerEvents: 'none',
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

                  <div
                    style={{
                      height: 42,
                      borderRadius: 999,
                      border: '2px solid #111111',
                      background: '#ffffff',
                      color: '#ef3e36',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '0 16px',
                      fontSize: 14,
                      fontWeight: 900,
                    }}
                  >
                    -{discountPercent || '20'}%
                  </div>
                </div>
              </div>

              <div style={{ padding: 16 }}>
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 900,
                    color: '#17130f',
                  }}
                >
                  {discountTitle || text.discountTitlePlaceholder}
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
                    {days} {getDayWord(days, language, text)}
                  </div>

                  <div
                    style={{
                      borderRadius: 999,
                      border: '2px solid #111111',
                      background: '#edf9ef',
                      padding: '10px 14px',
                      fontSize: 14,
                      fontWeight: 900,
                      color: '#2fa35a',
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
                  {text.openDeal}
                </button>
              </div>
            </div>
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
              <div>
                {text.category}: {currentCategory?.localizedLabel || '—'}
              </div>
              <div>
                {text.subcategory}:{' '}
                {subcategoryOptions.find((item) => item.value === subcategory)?.label || '—'}
              </div>
              <div>
                {text.discountPercent}: {discountPercent ? `${discountPercent}%` : '—'}
              </div>
              <div>
                {text.chooseDays}: {days}
              </div>
              <div>
                {text.totalToPay}: £{totalPrice}
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
