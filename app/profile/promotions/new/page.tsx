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
type BadgePreset = 'none' | 'discount' | 'top' | 'new';

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
  badgeHint: string;
  preview: string;
  previewHint: string;
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
  addMediaAlert: string;
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
  miniVideo: string;
  miniVideoHint: string;
  addMiniVideo: string;
  replaceMiniVideo: string;
  miniVideoAdded: string;
  removeMiniVideo: string;
  videoTooLong: string;
  invalidVideo: string;
  mediaRule: string;
  mediaTypePhoto: string;
  mediaTypeVideo: string;
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

const baseEn: PromotionTexts = {
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
  badgeNone: 'Nothing',
  badgeDiscount: 'Discount',
  badgeTop: 'TOP',
  badgeNew: 'NEW',
  badgeHint: 'Choose one badge for the ad card.',
  preview: 'Ad preview',
  previewHint: 'This is how clients will see your advertisement.',
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
  addMediaAlert: 'Add at least one photo or one mini video',
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
  miniVideo: 'Mini video',
  miniVideoHint: 'Optional. Add 1 short loop video up to 5 seconds.',
  addMiniVideo: 'Add mini video',
  replaceMiniVideo: 'Replace video',
  miniVideoAdded: 'Mini video added',
  removeMiniVideo: 'Remove video',
  videoTooLong: 'Mini video must be 5 seconds or shorter',
  invalidVideo: 'Please choose a valid video file',
  mediaRule: 'Use photos or 1 mini video. Not both at the same time.',
  mediaTypePhoto: 'Photo',
  mediaTypeVideo: 'Video',
};

const textByLanguage: Record<AppLanguage, PromotionTexts> = {
  EN: baseEn,
  RU: {
    ...baseEn,
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
    badgeHint: 'Выберите один бейдж для карточки рекламы.',
    preview: 'Превью рекламы',
    previewHint: 'Так рекламу увидит клиент.',
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
    addMediaAlert: 'Добавьте хотя бы одно фото или одно мини видео',
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
    miniVideo: 'Мини видео',
    miniVideoHint: 'Необязательно. Добавьте 1 короткое зацикленное видео до 5 секунд.',
    addMiniVideo: 'Добавить мини видео',
    replaceMiniVideo: 'Заменить видео',
    miniVideoAdded: 'Мини видео добавлено',
    removeMiniVideo: 'Удалить видео',
    videoTooLong: 'Мини видео должно быть не длиннее 5 секунд',
    invalidVideo: 'Пожалуйста, выберите корректный видеофайл',
    mediaRule: 'Используй или фото, или 1 мини видео. Одновременно нельзя.',
    mediaTypePhoto: 'Фото',
    mediaTypeVideo: 'Видео',
  },
  ES: baseEn,
  CZ: baseEn,
  DE: baseEn,
  PL: baseEn,
  UA: baseEn,
  IT: baseEn,
  FR: baseEn,
  AR: baseEn,
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
    { id: '10', label: '10 km', km: 10, pricePerDay: 1, color: '#2f8c67', bg: '#edf9ef' },
    { id: '50', label: '50 km', km: 50, pricePerDay: 2, color: '#c69212', bg: '#fff7d6' },
    { id: '100', label: '100 km', km: 100, pricePerDay: 3.5, color: '#e44b4b', bg: '#ffe6e6' },
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

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function getSafeScale(value: number) {
  return clamp(Number.isFinite(value) ? value : 1, MIN_SCALE, MAX_SCALE);
}

function getBadgeText(badge: BadgePreset, text: PromotionTexts) {
  if (badge === 'discount') return text.badgeDiscount;
  if (badge === 'top') return text.badgeTop;
  if (badge === 'new') return text.badgeNew;
  return '';
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
  const [badgePreset, setBadgePreset] = useState<BadgePreset>('none');
  const [days, setDays] = useState(10);
  const [radius, setRadius] = useState<RadiusOption['id']>('10');
  const [layout, setLayout] = useState<PhotoLayout>('single');
  const [showPhotoSourceMenu, setShowPhotoSourceMenu] = useState(false);
  const [showVideoSourceMenu, setShowVideoSourceMenu] = useState(false);
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

  const selectedRadius =
    radiusOptions.find((item) => item.id === radius) || radiusOptions[0];

  const currentCategory = categories.find((item) => item.id === categoryId) || null;
  const subcategoryOptions = currentCategory?.subcategories || [];

  const totalPrice = useMemo(
    () => Number((selectedRadius.pricePerDay * days).toFixed(2)),
    [selectedRadius.pricePerDay, days]
  );

  const editorPhoto = useMemo(
    () => photos.find((photo) => photo.id === editorPhotoId) || null,
    [photos, editorPhotoId]
  );

  const badgeText = getBadgeText(badgePreset, text);

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

  const clearAllPhotos = () => {
    setPhotos((prev) => {
      prev.forEach((photo) => {
        if (photo.preview) URL.revokeObjectURL(photo.preview);
      });
      return [];
    });
  };

  const clearMiniVideo = () => {
    setMiniVideo((prev) => {
      if (prev?.preview) URL.revokeObjectURL(prev.preview);
      return null;
    });
  };

  const handleFilesSelected = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    if (miniVideo) {
      clearMiniVideo();
    }

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
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      alert(text.invalidVideo);
      event.target.value = '';
      return;
    }

    if (photos.length > 0) {
      clearAllPhotos();
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
      alert(text.addMediaAlert);
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
                fontSize: 18,
                fontWeight: 900,
                color: '#17130f',
                marginBottom: 8,
              }}
            >
              {text.photo}
            </div>

            <div
              style={{
                fontSize: 14,
                lineHeight: 1.5,
                color: '#7b7268',
                fontWeight: 700,
                marginBottom: 10,
              }}
            >
              {text.photoHint}
            </div>

            <div
              style={{
                fontSize: 13,
                lineHeight: 1.45,
                color: '#2f7cf6',
                fontWeight: 800,
                marginBottom: 14,
              }}
            >
              {text.mediaRule}
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
                opacity: miniVideo ? 0.55 : 1,
              }}
              disabled={!!miniVideo}
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
                marginBottom: 10,
              }}
            >
              {text.miniVideoHint}
            </div>

            <div
              style={{
                fontSize: 13,
                lineHeight: 1.45,
                color: '#2f7cf6',
                fontWeight: 800,
                marginBottom: 14,
              }}
            >
              {text.mediaRule}
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
                  opacity: photos.length > 0 ? 0.55 : 1,
                }}
                disabled={photos.length > 0}
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
                  controls={false}
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

                  <div
                    style={{
                      display: 'flex',
                      gap: 8,
                      flexShrink: 0,
                    }}
                  >
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
                marginBottom: 10,
              }}
            >
              {text.badgeText}
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
              {text.badgeHint}
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 10,
              }}
            >
              {[
                { id: 'none' as BadgePreset, label: text.badgeNone },
                { id: 'discount' as BadgePreset, label: text.badgeDiscount },
                { id: 'top' as BadgePreset, label: text.badgeTop },
                { id: 'new' as BadgePreset, label: text.badgeNew },
              ].map((item) => {
                const active = badgePreset === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setBadgePreset(item.id)}
                    style={{
                      minHeight: 52,
                      borderRadius: 16,
                      border: '2px solid #111111',
                      background: active ? '#17130f' : '#fff',
                      color: active ? '#fff' : '#17130f',
                      fontSize: 15,
                      fontWeight: 900,
                      cursor: 'pointer',
                    }}
                  >
                    {item.label}
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
                fontSize: 18,
                fontWeight: 900,
                color: '#17130f',
                marginBottom: 8,
              }}
            >
              {text.preview}
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
              {text.previewHint}
            </div>

            <div
              style={{
                borderRadius: 24,
                border: '2px solid #111111',
                overflow: 'hidden',
                background: '#fff',
              }}
            >
              <div
                style={{
                  position: 'relative',
                  height: 220,
                  background: '#f2eee7',
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
                ) : photos.length > 0 ? (
                  <img
                    src={photos[0].preview}
                    alt={title || 'preview'}
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
                      color: '#9a9287',
                      fontSize: 16,
                      fontWeight: 800,
                    }}
                  >
                    {text.preview}
                  </div>
                )}

                {badgeText ? (
                  <div
                    style={{
                      position: 'absolute',
                      top: 12,
                      left: 12,
                      borderRadius: 999,
                      border: '1.5px solid #111111',
                      background: '#ffe44d',
                      color: '#17130f',
                      padding: '8px 12px',
                      fontSize: 13,
                      fontWeight: 900,
                    }}
                  >
                    {badgeText}
                  </div>
                ) : null}

                <div
                  style={{
                    position: 'absolute',
                    right: 12,
                    bottom: 12,
                    borderRadius: 999,
                    border: '1.5px solid #111111',
                    background: '#ffffff',
                    color: '#17130f',
                    padding: '7px 10px',
                    fontSize: 12,
                    fontWeight: 900,
                  }}
                >
                  {miniVideo ? text.mediaTypeVideo : text.mediaTypePhoto}
                </div>
              </div>

              <div style={{ padding: 14 }}>
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 900,
                    color: '#17130f',
                    lineHeight: 1.25,
                  }}
                >
                  {title.trim() || text.titlePlaceholder}
                </div>

                <div
                  style={{
                    marginTop: 6,
                    fontSize: 14,
                    color: '#6f675f',
                    fontWeight: 700,
                    lineHeight: 1.5,
                  }}
                >
                  {description.trim() || text.descriptionPlaceholder}
                </div>

                <div
                  style={{
                    marginTop: 12,
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 8,
                  }}
                >
                  {currentCategory?.label ? (
                    <span
                      style={{
                        borderRadius: 999,
                        border: '1.5px solid #111111',
                        background: '#fff',
                        padding: '7px 10px',
                        fontSize: 12,
                        fontWeight: 900,
                        color: '#17130f',
                      }}
                    >
                      {currentCategory.label}
                    </span>
                  ) : null}

                  {subcategory ? (
                    <span
                      style={{
                        borderRadius: 999,
                        border: '1.5px solid #111111',
                        background: '#fff',
                        padding: '7px 10px',
                        fontSize: 12,
                        fontWeight: 900,
                        color: '#17130f',
                      }}
                    >
                      {subcategory}
                    </span>
                  ) : null}

                  <span
                    style={{
                      borderRadius: 999,
                      border: '1.5px solid #111111',
                      background: selectedRadius.bg,
                      color: selectedRadius.color,
                      padding: '7px 10px',
                      fontSize: 12,
                      fontWeight: 900,
                    }}
                  >
                    {selectedRadius.label}
                  </span>
                </div>
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
              <div>{text.category}: {currentCategory?.label || '—'}</div>
              <div>{text.subcategory}: {subcategory || '—'}</div>
              <div>{text.radius}: {selectedRadius.label}</div>
              <div>{text.duration}: {days}</div>
              <div>£{selectedRadius.pricePerDay} / {text.perDay}</div>
              <div>{text.photosCount}: {photos.length}</div>
              <div>{text.miniVideo}: {miniVideo ? '1' : '0'}</div>
              <div>{text.badgeText}: {badgeText || text.badgeNone}</div>
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
