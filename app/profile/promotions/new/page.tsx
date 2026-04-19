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
  badgePlaceholder: string;
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
  removePhoto: string;
  photosCount: string;
  adjustPhoto: string;
  photoEditorHint: string;
  resetPhoto: string;
  applyPhoto: string;
  cancel: string;
};

type PhotoItem = {
  id: string;
  name: string;
  preview: string;
  scale: number;
  offsetX: number;
  offsetY: number;
};

const MIN_SCALE = 1;
const MAX_SCALE = 3;

const textByLanguage: Record<AppLanguage, PromotionTexts> = {
  EN: {
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
    badgePlaceholder: 'For example: -20% / TOP / NEW',
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
    addPhotoAlert: 'Add at least one photo for the ad',
    close: 'Close',
    paymentHint: 'Publication goes live only after payment.',
    firstAdBonus: 'First ad can be free for 7 days for new users',
    removePhoto: 'Remove',
    photosCount: 'Photos',
    adjustPhoto: 'Adjust photo',
    photoEditorHint: 'Move with one finger. Zoom with slider.',
    resetPhoto: 'Reset',
    applyPhoto: 'Apply',
    cancel: 'Cancel',
  },
  RU: {
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
    badgePlaceholder: 'Например: -20% / TOP / NEW',
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
    photoSource: 'Источник фото',
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
    addPhotoAlert: 'Добавьте хотя бы одно фото для рекламы',
    close: 'Закрыть',
    paymentHint: 'Публикация выйдет только после оплаты.',
    firstAdBonus: 'Первая реклама может быть бесплатной на 7 дней для новых пользователей',
    removePhoto: 'Удалить',
    photosCount: 'Фото',
    adjustPhoto: 'Настроить фото',
    photoEditorHint: 'Перемещай одним пальцем. Увеличивай ползунком.',
    resetPhoto: 'Сбросить',
    applyPhoto: 'Применить',
    cancel: 'Отмена',
  },
  ES: {
    pageTitle: 'Añadir publicidad',
    pageSubtitle: 'Crea un anuncio atractivo para conseguir más vistas y clientes.',
    category: 'Categoría',
    subcategory: 'Subcategoría',
    chooseCategory: 'Elige categoría',
    chooseSubcategory: 'Elige subcategoría',
    title: 'Título del anuncio',
    titlePlaceholder: 'Introduce el título del anuncio',
    description: 'Descripción',
    descriptionPlaceholder: 'Introduce la descripción del anuncio...',
    badgeText: 'Texto del badge / promo',
    badgePlaceholder: 'Por ejemplo: -20% / TOP / NEW',
    visibility: 'Visibilidad del anuncio',
    visibilityHint:
      'El anuncio se mostrará dentro del radio seleccionado desde el punto actual de búsqueda.',
    radius: 'Radio',
    perDay: 'por día',
    duration: 'Duración del anuncio',
    durationHint: 'De 10 a 30 días',
    days: 'Días',
    photo: 'Fotos',
    photoHint: 'Añade una o varias fotos para el anuncio.',
    addPhoto: 'Añadir fotos',
    photoAdded: 'Fotos añadidas',
    photoSource: 'Origen de foto',
    gallery: 'Galería',
    camera: 'Cámara',
    files: 'Archivos',
    layout: 'Diseño',
    layoutSingle: '1 foto',
    layoutGrid: 'Cuadrícula 2–9',
    summary: 'Resumen del anuncio',
    total: 'Total',
    continueToPayment: 'Continuar al pago',
    done: 'Hecho',
    enterCategory: 'Elige categoría',
    enterSubcategory: 'Elige subcategoría',
    enterTitle: 'Introduce el título del anuncio',
    enterDescription: 'Introduce la descripción del anuncio',
    addPhotoAlert: 'Añade al menos una foto para el anuncio',
    close: 'Cerrar',
    paymentHint: 'La publicación se activa solo después del pago.',
    firstAdBonus: 'El primer anuncio puede ser gratis durante 7 días para nuevos usuarios',
    removePhoto: 'Eliminar',
    photosCount: 'Fotos',
    adjustPhoto: 'Ajustar foto',
    photoEditorHint: 'Mueve con un dedo. Haz zoom con el control.',
    resetPhoto: 'Restablecer',
    applyPhoto: 'Aplicar',
    cancel: 'Cancelar',
  },
  CZ: {
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
    badgeText: 'Badge / promo text',
    badgePlaceholder: 'Například: -20% / TOP / NEW',
    visibility: 'Viditelnost reklamy',
    visibilityHint:
      'Reklama se bude zobrazovat ve zvoleném okruhu od aktuálního bodu vyhledávání.',
    radius: 'Okruh',
    perDay: 'za den',
    duration: 'Doba reklamy',
    durationHint: 'Od 10 do 30 dnů',
    days: 'Dny',
    photo: 'Fotky',
    photoHint: 'Přidejte jednu nebo více fotek pro reklamu.',
    addPhoto: 'Přidat fotky',
    photoAdded: 'Fotky přidány',
    photoSource: 'Zdroj fotky',
    gallery: 'Galerie',
    camera: 'Kamera',
    files: 'Soubory',
    layout: 'Rozložení',
    layoutSingle: '1 fotka',
    layoutGrid: 'Mřížka 2–9',
    summary: 'Shrnutí reklamy',
    total: 'Celkem',
    continueToPayment: 'Pokračovat k platbě',
    done: 'Hotovo',
    enterCategory: 'Vyberte kategorii',
    enterSubcategory: 'Vyberte podkategorii',
    enterTitle: 'Zadejte název reklamy',
    enterDescription: 'Zadejte popis reklamy',
    addPhotoAlert: 'Přidejte alespoň jednu fotku pro reklamu',
    close: 'Zavřít',
    paymentHint: 'Publikace bude aktivní až po platbě.',
    firstAdBonus: 'První reklama může být pro nové uživatele zdarma na 7 dní',
    removePhoto: 'Odstranit',
    photosCount: 'Fotky',
    adjustPhoto: 'Upravit fotku',
    photoEditorHint: 'Posuňte jedním prstem. Přibližte posuvníkem.',
    resetPhoto: 'Resetovat',
    applyPhoto: 'Použít',
    cancel: 'Zrušit',
  },
  DE: {
    pageTitle: 'Werbung hinzufügen',
    pageSubtitle: 'Erstellen Sie eine auffällige Werbung für mehr Aufrufe und Kunden.',
    category: 'Kategorie',
    subcategory: 'Unterkategorie',
    chooseCategory: 'Kategorie wählen',
    chooseSubcategory: 'Unterkategorie wählen',
    title: 'Werbetitel',
    titlePlaceholder: 'Werbetitel eingeben',
    description: 'Beschreibung',
    descriptionPlaceholder: 'Werbebeschreibung eingeben...',
    badgeText: 'Badge / Promo-Text',
    badgePlaceholder: 'Zum Beispiel: -20% / TOP / NEW',
    visibility: 'Sichtbarkeit der Werbung',
    visibilityHint:
      'Die Werbung wird im gewählten Radius vom aktuellen Suchpunkt angezeigt.',
    radius: 'Radius',
    perDay: 'pro Tag',
    duration: 'Laufzeit der Werbung',
    durationHint: 'Von 10 bis 30 Tagen',
    days: 'Tage',
    photo: 'Fotos',
    photoHint: 'Fügen Sie ein oder mehrere Fotos hinzu.',
    addPhoto: 'Fotos hinzufügen',
    photoAdded: 'Fotos hinzugefügt',
    photoSource: 'Fotoquelle',
    gallery: 'Galerie',
    camera: 'Kamera',
    files: 'Dateien',
    layout: 'Anzeigeformat',
    layoutSingle: '1 Foto',
    layoutGrid: 'Raster 2–9',
    summary: 'Werbeübersicht',
    total: 'Gesamt',
    continueToPayment: 'Weiter zur Zahlung',
    done: 'Fertig',
    enterCategory: 'Kategorie wählen',
    enterSubcategory: 'Unterkategorie wählen',
    enterTitle: 'Werbetitel eingeben',
    enterDescription: 'Werbebeschreibung eingeben',
    addPhotoAlert: 'Fügen Sie mindestens ein Foto hinzu',
    close: 'Schließen',
    paymentHint: 'Veröffentlichung erfolgt erst nach Zahlung.',
    firstAdBonus: 'Die erste Werbung kann für neue Nutzer 7 Tage kostenlos sein',
    removePhoto: 'Entfernen',
    photosCount: 'Fotos',
    adjustPhoto: 'Foto anpassen',
    photoEditorHint: 'Mit einem Finger verschieben. Mit dem Regler zoomen.',
    resetPhoto: 'Zurücksetzen',
    applyPhoto: 'Anwenden',
    cancel: 'Abbrechen',
  },
  PL: {
    pageTitle: 'Dodaj reklamę',
    pageSubtitle: 'Stwórz atrakcyjną reklamę, aby zdobyć więcej wyświetleń i klientów.',
    category: 'Kategoria',
    subcategory: 'Podkategoria',
    chooseCategory: 'Wybierz kategorię',
    chooseSubcategory: 'Wybierz podkategorię',
    title: 'Tytuł reklamy',
    titlePlaceholder: 'Wpisz tytuł reklamy',
    description: 'Opis',
    descriptionPlaceholder: 'Wpisz opis reklamy...',
    badgeText: 'Badge / tekst promo',
    badgePlaceholder: 'Na przykład: -20% / TOP / NEW',
    visibility: 'Widoczność reklamy',
    visibilityHint:
      'Reklama będzie wyświetlana w wybranym promieniu od aktualnego punktu wyszukiwania.',
    radius: 'Promień',
    perDay: 'za dzień',
    duration: 'Czas reklamy',
    durationHint: 'Od 10 do 30 dni',
    days: 'Dni',
    photo: 'Zdjęcia',
    photoHint: 'Dodaj jedno lub kilka zdjęć do reklamy.',
    addPhoto: 'Dodaj zdjęcia',
    photoAdded: 'Zdjęcia dodane',
    photoSource: 'Źródło zdjęcia',
    gallery: 'Galeria',
    camera: 'Kamera',
    files: 'Pliki',
    layout: 'Układ',
    layoutSingle: '1 zdjęcie',
    layoutGrid: 'Siatka 2–9',
    summary: 'Podsumowanie reklamy',
    total: 'Razem',
    continueToPayment: 'Przejdź do płatności',
    done: 'Gotowe',
    enterCategory: 'Wybierz kategorię',
    enterSubcategory: 'Wybierz podkategorię',
    enterTitle: 'Wpisz tytuł reklamy',
    enterDescription: 'Wpisz opis reklamy',
    addPhotoAlert: 'Dodaj co najmniej jedno zdjęcie',
    close: 'Zamknij',
    paymentHint: 'Publikacja będzie aktywna dopiero po płatności.',
    firstAdBonus: 'Pierwsza reklama może być darmowa na 7 dni dla nowych użytkowników',
    removePhoto: 'Usuń',
    photosCount: 'Zdjęcia',
    adjustPhoto: 'Dopasuj zdjęcie',
    photoEditorHint: 'Przesuwaj jednym palcem. Powiększaj suwakiem.',
    resetPhoto: 'Resetuj',
    applyPhoto: 'Zastosuj',
    cancel: 'Anuluj',
  },
  UA: {} as PromotionTexts,
  IT: {} as PromotionTexts,
  FR: {} as PromotionTexts,
  AR: {} as PromotionTexts,
};

(['UA', 'IT', 'FR', 'AR'] as AppLanguage[]).forEach((lang) => {
  textByLanguage[lang] = textByLanguage.EN;
});

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
  UA: [] as RadiusOption[],
  IT: [] as RadiusOption[],
  FR: [] as RadiusOption[],
  AR: [] as RadiusOption[],
};

(['UA', 'IT', 'FR', 'AR'] as AppLanguage[]).forEach((lang) => {
  radiusOptionsByLanguage[lang] = radiusOptionsByLanguage.EN;
});

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function getSafeScale(value: number) {
  return clamp(Number.isFinite(value) ? value : 1, MIN_SCALE, MAX_SCALE);
}

export default function NewPromotionPage() {
  const router = useRouter();

  const galleryInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const filesInputRef = useRef<HTMLInputElement | null>(null);

  const [language, setLanguage] = useState<AppLanguage>(getSavedLanguage());
  const [categoryId, setCategoryId] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [discountText, setDiscountText] = useState('');
  const [days, setDays] = useState(10);
  const [radius, setRadius] = useState<RadiusOption['id']>('10');
  const [layout, setLayout] = useState<PhotoLayout>('single');
  const [showPhotoSourceMenu, setShowPhotoSourceMenu] = useState(false);
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
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
        if (photo.preview) {
          URL.revokeObjectURL(photo.preview);
        }
      });
    };
  }, [photos]);

  const text = textByLanguage[language] || textByLanguage.EN;
  const radiusOptions = radiusOptionsByLanguage[language] || radiusOptionsByLanguage.EN;

  const selectedRadius =
    radiusOptions.find((item) => item.id === radius) || radiusOptions[0];

  const currentCategory =
    categories.find((item) => item.id === categoryId) || null;

  const subcategoryOptions = currentCategory?.subcategories || [];

  const totalPrice = useMemo(
    () => Number((selectedRadius.pricePerDay * days).toFixed(2)),
    [selectedRadius.pricePerDay, days]
  );

  const editorPhoto = useMemo(
    () => photos.find((photo) => photo.id === editorPhotoId) || null,
    [photos, editorPhotoId]
  );

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

  const handleRemovePhoto = (id: string) => {
    setPhotos((prev) => {
      const found = prev.find((photo) => photo.id === id);
      if (found?.preview) {
        URL.revokeObjectURL(found.preview);
      }
      return prev.filter((photo) => photo.id !== id);
    });

    if (editorPhotoId === id) {
      closeEditor();
    }
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

    if (photos.length === 0) {
      alert(text.addPhotoAlert);
      return;
    }

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

            <input
              value={discountText}
              onChange={(e) => setDiscountText(e.target.value)}
              placeholder={text.badgePlaceholder}
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

            <div
              style={{
                display: 'grid',
                gap: 10,
              }}
            >
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
                {text.category}: {currentCategory?.label || '—'}
              </div>
              <div>
                {text.subcategory}: {subcategory || '—'}
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
