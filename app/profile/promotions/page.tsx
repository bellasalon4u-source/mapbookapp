'use client';

import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import {
  addPromotion,
  getPromotions,
  subscribeToPromotionsStore,
  updatePromotion,
  type PromotionItem,
} from '../../../services/promotionsStore';
import { getAllMasters } from '../../../services/masters';
import { categories } from '../../../services/categories';
import { getSavedLanguage } from '../../../services/i18n';

const radiusOptions = [1, 3, 5, 10, 15, 25];
const durationOptions = [1, 3, 7, 14];
const MAX_PROMO_PHOTOS = 4;

function formatMoney(value: number) {
  return `£${value.toFixed(0)}`;
}

function formatDateLabel(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';

  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatTimeLeft(endAt: string) {
  const end = new Date(endAt).getTime();
  const now = Date.now();
  const diff = Math.max(0, end - now);

  const totalMinutes = Math.floor(diff / 1000 / 60);
  const days = Math.floor(totalMinutes / 60 / 24);
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) return `${days}d ${hours}h`;
  return `${hours}h ${String(minutes).padStart(2, '0')}m`;
}

function calcPromotionPrice(radiusKm: number, days: number) {
  const base = 6;
  const radiusPart = radiusKm * 1.6;
  const durationPart = days * 3.5;
  return Math.round(base + radiusPart + durationPart);
}

function makeId() {
  return `promo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function getLabels(language: string) {
  const isRu = language === 'RU';

  return {
    pageTitle: isRu ? 'Мои рекламы' : 'My Promotions',
    pageSubtitle: isRu
      ? 'Создавайте, запускайте и управляйте рекламой'
      : 'Create, launch and manage your ads',
    activeAds: isRu ? 'Активные рекламы' : 'Active ads',
    totalViews: isRu ? 'Всего просмотров' : 'Total views',
    spent: isRu ? 'Потрачено' : 'Spent',
    bookingsFromAds: isRu ? 'Брони из рекламы' : 'Bookings from ads',
    activePromotions: isRu ? 'Активные рекламы' : 'Active promotions',
    previousPromotions: isRu ? 'Прошлые рекламы' : 'Previous promotions',
    newPromotion: isRu ? 'Новая реклама' : 'New promotion',
    sponsored: 'Sponsored',
    active: isRu ? 'Активна' : 'Active',
    pause: isRu ? 'Пауза' : 'Pause',
    relaunch: isRu ? 'Перезапустить' : 'Relaunch',
    edit: isRu ? 'Редактировать' : 'Edit',
    views: isRu ? 'Просмотры' : 'Views',
    photoSectionTitle: isRu ? 'Фото рекламы' : 'Promotion photos',
    uploadMethods: isRu ? 'Способы загрузки' : 'Upload methods',
    takePhoto: isRu ? 'Сделать фото' : 'Take photo',
    chooseGallery: isRu ? 'Выбрать из галереи' : 'Choose from gallery',
    browseFiles: isRu ? 'Выбрать файл' : 'Browse files',
    useLink: isRu ? 'Вставить ссылку' : 'Use image link',
    addPhoto: isRu ? 'Добавить фото' : 'Add photo',
    replacePhoto: isRu ? 'Заменить фото' : 'Replace photo',
    title: isRu ? 'Заголовок' : 'Title',
    titlePlaceholder: isRu ? 'Введите заголовок рекламы' : 'Enter promotion title',
    description: isRu ? 'Описание' : 'Description',
    descriptionPlaceholder: isRu
      ? 'Например: скидка 20% только на этой неделе'
      : 'Example: 20% off this week',
    category: isRu ? 'Категория' : 'Category',
    radius: isRu ? 'Радиус показа' : 'Radius',
    days: isRu ? 'Длительность' : 'Days',
    discount: isRu ? 'Скидка' : 'Discount',
    discountPlaceholder: isRu ? 'Введите процент' : 'Enter percent',
    estimatedPrice: isRu ? 'Примерная цена' : 'Estimated price',
    launchPromotion: isRu ? 'Запустить рекламу' : 'Launch promotion',
    launching: isRu ? 'Запускаем...' : 'Launching...',
    promoPreview: isRu ? 'Предпросмотр рекламы' : 'Promotion preview',
    specialOffer: isRu ? 'Специальное предложение' : 'Special offer',
    validPeriod: isRu ? 'Срок' : 'Period',
    close: isRu ? 'Закрыть' : 'Close',
    imageLinkPrompt: isRu ? 'Вставьте ссылку на изображение' : 'Paste image URL',
    defaultPreviewText: isRu
      ? 'Добавьте до 4 фото для рекламы'
      : 'Add up to 4 photos for your promotion',
    maxPhotosHint: isRu ? 'Можно добавить до 4 фото' : 'You can add up to 4 photos',
    deletePhoto: isRu ? 'Удалить фото' : 'Delete photo',
    mainPhoto: isRu ? 'Главное фото' : 'Main photo',
    percent: isRu ? 'Скидка' : 'Discount',
  };
}

function getCollageLayout(photosCount: number) {
  if (photosCount <= 1) {
    return {
      display: 'grid',
      gridTemplateColumns: '1fr',
      gridTemplateRows: '220px',
      gap: 0,
    } as const;
  }

  if (photosCount === 2) {
    return {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gridTemplateRows: '220px',
      gap: 6,
    } as const;
  }

  if (photosCount === 3) {
    return {
      display: 'grid',
      gridTemplateColumns: '1.2fr 0.8fr',
      gridTemplateRows: '107px 107px',
      gap: 6,
    } as const;
  }

  return {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gridTemplateRows: '107px 107px',
    gap: 6,
  } as const;
}

function renderPromoCollage(
  photos: string[],
  alt: string,
  height = 220,
  rounded = 0
) {
  const safePhotos = photos.filter(Boolean).slice(0, MAX_PROMO_PHOTOS);

  if (safePhotos.length === 0) {
    return (
      <div
        style={{
          height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#9aa2af',
          fontSize: 15,
          fontWeight: 700,
          textAlign: 'center',
          padding: 20,
          background: '#f3f4f6',
        }}
      >
        No photo
      </div>
    );
  }

  const layout = getCollageLayout(safePhotos.length);

  return (
    <div
      style={{
        ...layout,
        height,
        borderRadius: rounded,
        overflow: 'hidden',
        background: '#f3f4f6',
      }}
    >
      {safePhotos.map((photo, index) => {
        const extraStyle: React.CSSProperties =
          safePhotos.length === 3 && index === 0
            ? { gridRow: '1 / span 2' }
            : {};

        return (
          <div
            key={`${photo}-${index}`}
            style={{
              position: 'relative',
              overflow: 'hidden',
              background: '#eef1f4',
              ...extraStyle,
            }}
          >
            <img
              src={photo}
              alt={alt}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
              }}
            />
          </div>
        );
      })}
    </div>
  );
}

export default function PromotionsPage() {
  const router = useRouter();
  const masters = getAllMasters();

  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);
  const filesInputRef = useRef<HTMLInputElement | null>(null);

  const [language, setLanguage] = useState(getSavedLanguage());
  const [promotions, setPromotions] = useState<PromotionItem[]>([]);
  const [title, setTitle] = useState('Keratin Hair Extensions');
  const [description, setDescription] = useState('20% off this week');
  const [photos, setPhotos] = useState<string[]>([
    'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1200&q=80',
  ]);
  const [categoryId, setCategoryId] = useState('beauty');
  const [radiusKm, setRadiusKm] = useState(5);
  const [durationDays, setDurationDays] = useState(3);
  const [discountEnabled, setDiscountEnabled] = useState(true);
  const [discountPercent, setDiscountPercent] = useState('20');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const labels = getLabels(language);

  useEffect(() => {
    const load = () => setPromotions(getPromotions());
    load();
    return subscribeToPromotionsStore(load);
  }, []);

  useEffect(() => {
    const syncLanguage = () => {
      setLanguage(getSavedLanguage());
    };

    syncLanguage();
    window.addEventListener('focus', syncLanguage);
    window.addEventListener('storage', syncLanguage);

    return () => {
      window.removeEventListener('focus', syncLanguage);
      window.removeEventListener('storage', syncLanguage);
    };
  }, []);

  const activePromotions = useMemo(() => {
    const now = Date.now();

    return promotions.filter((item) => {
      const start = new Date(item.startAt).getTime();
      const end = new Date(item.endAt).getTime();
      return item.status === 'active' && now >= start && now <= end;
    });
  }, [promotions]);

  const archivedPromotions = useMemo(() => {
    const now = Date.now();

    return promotions.filter((item) => {
      const end = new Date(item.endAt).getTime();
      return item.status !== 'active' || end < now;
    });
  }, [promotions]);

  const totalViews = useMemo(() => {
    return promotions.reduce((sum, item) => sum + item.views, 0);
  }, [promotions]);

  const totalSpent = useMemo(() => {
    return promotions.reduce((sum, item) => {
      const start = new Date(item.startAt).getTime();
      const end = new Date(item.endAt).getTime();
      const days = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
      return sum + calcPromotionPrice(item.radiusKm, days);
    }, 0);
  }, [promotions]);

  const price = calcPromotionPrice(radiusKm, durationDays);
  const featuredMaster = masters[0];

  const categoryLabel =
    categories.find((item: any) => item.id === categoryId)?.label ||
    categories.find((item: any) => item.id === categoryId)?.name ||
    categoryId;

  const previewTitle = title.trim() || 'Keratin Hair Extensions';

  const previewDescription = description.trim()
    ? description.trim()
    : discountEnabled && discountPercent.trim()
    ? `${discountPercent.trim()}% off`
    : labels.specialOffer;

  const activeDiscountText =
    discountEnabled && discountPercent.trim()
      ? `${labels.percent}: ${discountPercent.trim()}%`
      : '';

  const readFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    const incomingFiles = Array.from(fileList).slice(0, MAX_PROMO_PHOTOS - photos.length);
    if (incomingFiles.length === 0) return;

    incomingFiles.forEach((file) => {
      const reader = new FileReader();

      reader.onload = () => {
        const result = typeof reader.result === 'string' ? reader.result : '';
        if (!result) return;

        setPhotos((prev) => {
          if (prev.length >= MAX_PROMO_PHOTOS) return prev;
          return [...prev, result].slice(0, MAX_PROMO_PHOTOS);
        });
      };

      reader.readAsDataURL(file);
    });
  };

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    readFiles(event.target.files);
    event.target.value = '';
  };

  const handleUseLink = () => {
    if (photos.length >= MAX_PROMO_PHOTOS) return;

    const value = window.prompt(labels.imageLinkPrompt, '');
    if (value && value.trim()) {
      setPhotos((prev) => [...prev, value.trim()].slice(0, MAX_PROMO_PHOTOS));
    }
  };

  const handleRemovePhotoAt = (index: number) => {
    setPhotos((prev) => prev.filter((_, itemIndex) => itemIndex !== index));
  };

  const handleLaunchPromotion = () => {
    if (!previewTitle.trim()) return;
    if (photos.length === 0) return;

    setIsSubmitting(true);

    const now = new Date();
    const end = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

    addPromotion({
      id: makeId(),
      masterId: String(featuredMaster?.id || 'master-1'),
      title: previewTitle.trim(),
      subtitle: previewDescription.trim(),
      image: photos[0],
      categoryId,
      centerLat: Number(featuredMaster?.lat || 51.5074),
      centerLng: Number(featuredMaster?.lng || -0.1278),
      radiusKm,
      startAt: now.toISOString(),
      endAt: end.toISOString(),
      createdAt: now.toISOString(),
      status: 'active',
      views: 0,
    });

    setTimeout(() => {
      setIsSubmitting(false);
      setTitle('');
      setDescription('');
      setPhotos([]);
      setRadiusKm(5);
      setDurationDays(3);
      setDiscountEnabled(true);
      setDiscountPercent('20');
    }, 300);
  };

  const handlePausePromotion = (promotionId: string) => {
    updatePromotion(promotionId, { status: 'paused' });
  };

  const handleResumePromotion = (promotionId: string) => {
    updatePromotion(promotionId, { status: 'active' });
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#f7f3eb',
        fontFamily: 'Arial, sans-serif',
        color: '#1f2430',
        padding: '20px 16px 40px',
      }}
    >
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        onChange={handleImageChange}
        style={{ display: 'none' }}
      />

      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleImageChange}
        style={{ display: 'none' }}
      />

      <input
        ref={filesInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleImageChange}
        style={{ display: 'none' }}
      />

      <div style={{ maxWidth: 430, margin: '0 auto' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '64px 1fr 64px',
            alignItems: 'center',
            gap: 12,
            marginBottom: 18,
          }}
        >
          <button
            onClick={() => router.back()}
            style={{
              width: 64,
              height: 64,
              borderRadius: 999,
              border: '1px solid #e8e1d7',
              background: '#ffffff',
              fontSize: 28,
              color: '#23263a',
              cursor: 'pointer',
              boxShadow: '0 6px 16px rgba(0,0,0,0.05)',
            }}
          >
            ←
          </button>

          <div>
            <div
              style={{
                fontSize: 22,
                lineHeight: 1.1,
                fontWeight: 900,
                color: '#202335',
              }}
            >
              {labels.pageTitle}
            </div>

            <div
              style={{
                marginTop: 6,
                fontSize: 13,
                lineHeight: 1.45,
                color: '#7b8390',
                fontWeight: 700,
              }}
            >
              {labels.pageSubtitle}
            </div>
          </div>

          <button
            onClick={() => router.push('/')}
            style={{
              width: 64,
              height: 64,
              borderRadius: 999,
              border: '1px solid #e8e1d7',
              background: '#ffffff',
              fontSize: 30,
              color: '#23263a',
              cursor: 'pointer',
              boxShadow: '0 6px 16px rgba(0,0,0,0.05)',
            }}
            title={labels.close}
          >
            ×
          </button>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            gap: 12,
            marginBottom: 20,
          }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: 26,
              padding: 16,
              boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
            }}
          >
            <div style={{ fontSize: 12, color: '#7b848f', fontWeight: 800 }}>
              {labels.activeAds}
            </div>
            <div
              style={{
                marginTop: 10,
                fontSize: 30,
                fontWeight: 900,
                color: '#ff3b30',
              }}
            >
              {activePromotions.length}
            </div>
          </div>

          <div
            style={{
              background: '#fff',
              borderRadius: 26,
              padding: 16,
              boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
            }}
          >
            <div style={{ fontSize: 12, color: '#7b848f', fontWeight: 800 }}>
              {labels.totalViews}
            </div>
            <div
              style={{
                marginTop: 10,
                fontSize: 30,
                fontWeight: 900,
                color: '#ff3b30',
              }}
            >
              {totalViews}
            </div>
          </div>

          <div
            style={{
              background: '#fff',
              borderRadius: 26,
              padding: 16,
              boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
            }}
          >
            <div style={{ fontSize: 12, color: '#7b848f', fontWeight: 800 }}>
              {labels.spent}
            </div>
            <div
              style={{
                marginTop: 10,
                fontSize: 30,
                fontWeight: 900,
                color: '#ff3b30',
              }}
            >
              {formatMoney(totalSpent)}
            </div>
          </div>

          <div
            style={{
              background: '#fff',
              borderRadius: 26,
              padding: 16,
              boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
            }}
          >
            <div style={{ fontSize: 12, color: '#7b848f', fontWeight: 800 }}>
              {labels.bookingsFromAds}
            </div>
            <div
              style={{
                marginTop: 10,
                fontSize: 30,
                fontWeight: 900,
                color: '#2ea44f',
              }}
            >
              0
            </div>
          </div>
        </div>

        {activePromotions.length > 0 ? (
          <div style={{ marginBottom: 22 }}>
            <div
              style={{
                fontSize: 18,
                fontWeight: 900,
                marginBottom: 12,
                color: '#202335',
              }}
            >
              {labels.activePromotions}
            </div>

            <div style={{ display: 'grid', gap: 16 }}>
              {activePromotions.map((promo) => (
                <div
                  key={promo.id}
                  style={{
                    background: '#fff',
                    borderRadius: 30,
                    overflow: 'hidden',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
                  }}
                >
                  <div style={{ position: 'relative' }}>
                    <img
                      src={promo.image}
                      alt={promo.title}
                      style={{
                        width: '100%',
                        height: 220,
                        objectFit: 'cover',
                        display: 'block',
                      }}
                    />

                    <div
                      style={{
                        position: 'absolute',
                        top: 16,
                        left: 16,
                        background: '#ffffff',
                        color: '#ff4f93',
                        borderRadius: 999,
                        padding: '10px 18px',
                        fontSize: 12,
                        fontWeight: 900,
                      }}
                    >
                      {labels.sponsored}
                    </div>
                  </div>

                  <div style={{ padding: 18 }}>
                    <div
                      style={{
                        fontSize: 28,
                        lineHeight: 1.08,
                        fontWeight: 900,
                        color: '#202335',
                      }}
                    >
                      {promo.title}
                    </div>

                    <div
                      style={{
                        marginTop: 8,
                        fontSize: 15,
                        color: '#717987',
                        fontWeight: 700,
                      }}
                    >
                      {promo.subtitle || labels.specialOffer}
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 10,
                        marginTop: 16,
                      }}
                    >
                      <div
                        style={{
                          padding: '10px 14px',
                          borderRadius: 999,
                          background: '#fff5f5',
                          border: '1px solid #f4d4d2',
                          color: '#ff3b30',
                          fontWeight: 900,
                          fontSize: 14,
                        }}
                      >
                        {labels.active}
                      </div>

                      <div
                        style={{
                          padding: '10px 14px',
                          borderRadius: 999,
                          background: '#fff5f5',
                          border: '1px solid #f4d4d2',
                          color: '#ff3b30',
                          fontWeight: 900,
                          fontSize: 14,
                        }}
                      >
                        {formatMoney(
                          calcPromotionPrice(
                            promo.radiusKm,
                            Math.max(
                              1,
                              Math.ceil(
                                (new Date(promo.endAt).getTime() -
                                  new Date(promo.startAt).getTime()) /
                                  (1000 * 60 * 60 * 24)
                              )
                            )
                          )
                        )}
                      </div>

                      <div
                        style={{
                          padding: '10px 14px',
                          borderRadius: 999,
                          background: '#fff5f5',
                          border: '1px solid #f4d4d2',
                          color: '#ff3b30',
                          fontWeight: 900,
                          fontSize: 14,
                        }}
                      >
                        {formatTimeLeft(promo.endAt)}
                      </div>

                      <div
                        style={{
                          padding: '10px 14px',
                          borderRadius: 999,
                          background: '#f8f9fb',
                          border: '1px solid #e5e7eb',
                          color: '#1f2430',
                          fontWeight: 900,
                          fontSize: 14,
                        }}
                      >
                        {labels.views}: {promo.views}
                      </div>
                    </div>

                    <div
                      style={{
                        marginTop: 16,
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: 10,
                      }}
                    >
                      <button
                        onClick={() => router.push(`/promotion/${promo.id}`)}
                        style={{
                          height: 50,
                          borderRadius: 18,
                          border: '1px solid #e7dfd2',
                          background: '#ffffff',
                          color: '#1f2430',
                          fontSize: 16,
                          fontWeight: 900,
                          cursor: 'pointer',
                        }}
                      >
                        {labels.edit}
                      </button>

                      <button
                        onClick={() => handlePausePromotion(promo.id)}
                        style={{
                          height: 50,
                          border: 'none',
                          borderRadius: 18,
                          background: '#f4d44d',
                          color: '#533f00',
                          fontSize: 16,
                          fontWeight: 900,
                          cursor: 'pointer',
                        }}
                      >
                        {labels.pause}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div
          style={{
            background: '#fff',
            borderRadius: 30,
            padding: 18,
            boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
            marginBottom: 22,
          }}
        >
          <div
            style={{
              fontSize: 22,
              fontWeight: 900,
              color: '#202335',
              marginBottom: 14,
            }}
          >
            {labels.newPromotion}
          </div>

          <div style={{ display: 'grid', gap: 16 }}>
            <div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 800,
                  color: '#6f7782',
                  marginBottom: 10,
                }}
              >
                {labels.photoSectionTitle}
              </div>

              <div
                style={{
                  borderRadius: 24,
                  overflow: 'hidden',
                  background: '#f3f4f6',
                  border: '1px solid #ece7df',
                  padding: 8,
                }}
              >
                {photos.length > 0 ? (
                  <div
                    style={{
                      ...getCollageLayout(photos.length),
                      height: 220,
                    }}
                  >
                    {photos.map((photo, index) => {
                      const extraStyle: React.CSSProperties =
                        photos.length === 3 && index === 0
                          ? { gridRow: '1 / span 2' }
                          : {};

                      return (
                        <div
                          key={`${photo}-${index}`}
                          style={{
                            position: 'relative',
                            overflow: 'hidden',
                            borderRadius: 18,
                            background: '#eef1f4',
                            ...extraStyle,
                          }}
                        >
                          <img
                            src={photo}
                            alt={`Promotion ${index + 1}`}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              display: 'block',
                            }}
                          />

                          <button
                            onClick={() => handleRemovePhotoAt(index)}
                            title={labels.deletePhoto}
                            style={{
                              position: 'absolute',
                              top: 8,
                              right: 8,
                              width: 28,
                              height: 28,
                              borderRadius: 999,
                              border: 'none',
                              background: 'rgba(0,0,0,0.72)',
                              color: '#fff',
                              fontSize: 16,
                              fontWeight: 900,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            ×
                          </button>

                          {index === 0 ? (
                            <div
                              style={{
                                position: 'absolute',
                                left: 8,
                                bottom: 8,
                                padding: '6px 10px',
                                borderRadius: 999,
                                background: 'rgba(255,255,255,0.92)',
                                color: '#202335',
                                fontSize: 11,
                                fontWeight: 900,
                              }}
                            >
                              {labels.mainPhoto}
                            </div>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div
                    style={{
                      height: 220,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#9aa2af',
                      fontSize: 15,
                      fontWeight: 700,
                      textAlign: 'center',
                      padding: 20,
                    }}
                  >
                    {labels.defaultPreviewText}
                  </div>
                )}
              </div>

              <div
                style={{
                  marginTop: 8,
                  fontSize: 12,
                  fontWeight: 700,
                  color: '#8a93a0',
                }}
              >
                {labels.maxPhotosHint}
              </div>
            </div>

            <div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 800,
                  color: '#6f7782',
                  marginBottom: 10,
                }}
              >
                {labels.uploadMethods}
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 10,
                }}
              >
                <button
                  onClick={() => cameraInputRef.current?.click()}
                  style={{
                    minHeight: 52,
                    borderRadius: 18,
                    border: '1px solid #dfe7df',
                    background: '#f2fbf4',
                    color: '#2d8c46',
                    fontSize: 15,
                    fontWeight: 900,
                    cursor: 'pointer',
                  }}
                >
                  {labels.takePhoto}
                </button>

                <button
                  onClick={() => galleryInputRef.current?.click()}
                  style={{
                    minHeight: 52,
                    borderRadius: 18,
                    border: '1px solid #e7dfd2',
                    background: '#ffffff',
                    color: '#1f2430',
                    fontSize: 15,
                    fontWeight: 900,
                    cursor: 'pointer',
                  }}
                >
                  {labels.chooseGallery}
                </button>

                <button
                  onClick={() => filesInputRef.current?.click()}
                  style={{
                    minHeight: 52,
                    borderRadius: 18,
                    border: '1px solid #e7dfd2',
                    background: '#ffffff',
                    color: '#1f2430',
                    fontSize: 15,
                    fontWeight: 900,
                    cursor: 'pointer',
                  }}
                >
                  {labels.browseFiles}
                </button>

                <button
                  onClick={handleUseLink}
                  disabled={photos.length >= MAX_PROMO_PHOTOS}
                  style={{
                    minHeight: 52,
                    borderRadius: 18,
                    border: '1px solid #f3d7d4',
                    background: '#fff5f5',
                    color: '#ff3b30',
                    fontSize: 15,
                    fontWeight: 900,
                    cursor: photos.length >= MAX_PROMO_PHOTOS ? 'not-allowed' : 'pointer',
                    opacity: photos.length >= MAX_PROMO_PHOTOS ? 0.55 : 1,
                  }}
                >
                  {labels.useLink}
                </button>
              </div>

              <div style={{ marginTop: 10 }}>
                <button
                  onClick={() => galleryInputRef.current?.click()}
                  disabled={photos.length >= MAX_PROMO_PHOTOS}
                  style={{
                    width: '100%',
                    minHeight: 48,
                    borderRadius: 16,
                    border: '1px solid #e7dfd2',
                    background: '#ffffff',
                    color: '#1f2430',
                    fontSize: 14,
                    fontWeight: 800,
                    cursor: photos.length >= MAX_PROMO_PHOTOS ? 'not-allowed' : 'pointer',
                    opacity: photos.length >= MAX_PROMO_PHOTOS ? 0.55 : 1,
                  }}
                >
                  {labels.addPhoto}
                </button>
              </div>
            </div>

            <div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 800,
                  color: '#6f7782',
                  marginBottom: 8,
                }}
              >
                {labels.title}
              </div>

              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={labels.titlePlaceholder}
                style={{
                  width: '100%',
                  height: 50,
                  borderRadius: 16,
                  border: '1px solid #e7dfd2',
                  padding: '0 14px',
                  fontSize: 15,
                  outline: 'none',
                  color: '#1f2430',
                }}
              />
            </div>

            <div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 800,
                  color: '#6f7782',
                  marginBottom: 8,
                }}
              >
                {labels.description}
              </div>

              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={labels.descriptionPlaceholder}
                style={{
                  width: '100%',
                  minHeight: 110,
                  borderRadius: 16,
                  border: '1px solid #e7dfd2',
                  padding: '14px',
                  fontSize: 15,
                  outline: 'none',
                  color: '#1f2430',
                  resize: 'vertical',
                  fontFamily: 'Arial, sans-serif',
                }}
              />
            </div>

            <div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 800,
                  color: '#6f7782',
                  marginBottom: 8,
                }}
              >
                {labels.discount}
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '120px 1fr',
                  gap: 10,
                }}
              >
                <button
                  onClick={() => setDiscountEnabled((prev) => !prev)}
                  style={{
                    height: 50,
                    borderRadius: 16,
                    border: discountEnabled ? '2px solid #2ea44f' : '1px solid #e7dfd2',
                    background: discountEnabled ? '#f1fbf4' : '#ffffff',
                    color: discountEnabled ? '#238a4f' : '#1f2430',
                    fontSize: 14,
                    fontWeight: 900,
                    cursor: 'pointer',
                  }}
                >
                  {discountEnabled ? 'ON' : 'OFF'}
                </button>

                <div
                  style={{
                    height: 50,
                    borderRadius: 16,
                    border: '1px solid #e7dfd2',
                    background: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 14px',
                    gap: 10,
                  }}
                >
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 900,
                      color: '#6f7782',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {labels.percent}
                  </span>

                  <input
                    value={discountPercent}
                    onChange={(e) =>
                      setDiscountPercent(e.target.value.replace(/[^0-9]/g, '').slice(0, 2))
                    }
                    placeholder={labels.discountPlaceholder}
                    disabled={!discountEnabled}
                    style={{
                      width: '100%',
                      border: 'none',
                      outline: 'none',
                      fontSize: 15,
                      color: '#1f2430',
                      background: 'transparent',
                    }}
                  />

                  <span
                    style={{
                      fontSize: 16,
                      fontWeight: 900,
                      color: '#202335',
                    }}
                  >
                    %
                  </span>
                </div>
              </div>
            </div>

            <div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 800,
                  color: '#6f7782',
                  marginBottom: 8,
                }}
              >
                {labels.category}
              </div>

              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                style={{
                  width: '100%',
                  height: 50,
                  borderRadius: 16,
                  border: '1px solid #e7dfd2',
                  padding: '0 14px',
                  fontSize: 15,
                  outline: 'none',
                  background: '#ffffff',
                  color: '#1f2430',
                }}
              >
                {categories.map((item: any) => (
                  <option key={item.id} value={item.id}>
                    {item.label || item.name || item.id}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 800,
                  color: '#6f7782',
                  marginBottom: 8,
                }}
              >
                {labels.radius}
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {radiusOptions.map((item) => (
                  <button
                    key={item}
                    onClick={() => setRadiusKm(item)}
                    style={{
                      border: radiusKm === item ? '2px solid #ff3b30' : '1px solid #e7dfd2',
                      background: radiusKm === item ? '#fff5f5' : '#fff',
                      color: radiusKm === item ? '#ff3b30' : '#1f2430',
                      borderRadius: 999,
                      padding: '10px 14px',
                      fontWeight: 900,
                      fontSize: 14,
                      cursor: 'pointer',
                    }}
                  >
                    {item} km
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 800,
                  color: '#6f7782',
                  marginBottom: 8,
                }}
              >
                {labels.days}
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {durationOptions.map((item) => (
                  <button
                    key={item}
                    onClick={() => setDurationDays(item)}
                    style={{
                      border: durationDays === item ? '2px solid #ff3b30' : '1px solid #e7dfd2',
                      background: durationDays === item ? '#fff5f5' : '#fff',
                      color: durationDays === item ? '#ff3b30' : '#1f2430',
                      borderRadius: 999,
                      padding: '10px 14px',
                      fontWeight: 900,
                      fontSize: 14,
                      cursor: 'pointer',
                    }}
                  >
                    {item} {language === 'RU' ? 'дн.' : item > 1 ? 'days' : 'day'}
                  </button>
                ))}
              </div>
            </div>

            <div
              style={{
                background: '#fff5f5',
                border: '1px solid #f3d7d4',
                borderRadius: 22,
                padding: 16,
              }}
            >
              <div style={{ fontSize: 12, color: '#7b848f', fontWeight: 800 }}>
                {labels.estimatedPrice}
              </div>

              <div
                style={{
                  marginTop: 6,
                  fontSize: 32,
                  fontWeight: 900,
                  color: '#ff3b30',
                }}
              >
                {formatMoney(price)}
              </div>

              <div
                style={{
                  marginTop: 6,
                  fontSize: 13,
                  color: '#6f7782',
                  fontWeight: 700,
                }}
              >
                {radiusKm} km • {durationDays}{' '}
                {language === 'RU' ? 'дн.' : durationDays > 1 ? 'days' : 'day'}
              </div>
            </div>

            <div
              style={{
                background: '#fff',
                borderRadius: 26,
                border: '1px solid #ece4d9',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  padding: '16px 16px 8px',
                  fontSize: 18,
                  fontWeight: 900,
                  color: '#202335',
                }}
              >
                {labels.promoPreview}
              </div>

              <div style={{ padding: 16, paddingTop: 8 }}>
                <div
                  style={{
                    background: '#fff',
                    borderRadius: 28,
                    overflow: 'hidden',
                    boxShadow: '0 10px 28px rgba(0,0,0,0.06)',
                    border: '1px solid #efe7db',
                  }}
                >
                  <div style={{ position: 'relative' }}>
                    {renderPromoCollage(
                      photos.length > 0
                        ? photos
                        : [
                            'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1200&q=80',
                          ],
                      previewTitle,
                      180
                    )}

                    <div
                      style={{
                        position: 'absolute',
                        top: 14,
                        left: 14,
                        background: '#ffffff',
                        color: '#ff4f93',
                        borderRadius: 999,
                        padding: '9px 16px',
                        fontSize: 12,
                        fontWeight: 900,
                      }}
                    >
                      {labels.sponsored}
                    </div>
                  </div>

                  <div style={{ padding: 16 }}>
                    <div
                      style={{
                        fontSize: 26,
                        lineHeight: 1.08,
                        fontWeight: 900,
                        color: '#202335',
                      }}
                    >
                      {previewTitle}
                    </div>

                    <div
                      style={{
                        marginTop: 8,
                        fontSize: 15,
                        color: '#717987',
                        fontWeight: 700,
                      }}
                    >
                      {previewDescription}
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 10,
                        marginTop: 14,
                      }}
                    >
                      <div
                        style={{
                          padding: '10px 14px',
                          borderRadius: 999,
                          background: '#fff5fa',
                          border: '1px solid #f4d8e8',
                          color: '#ff4f93',
                          fontWeight: 900,
                          fontSize: 14,
                        }}
                      >
                        {labels.views}: 0
                      </div>

                      <div
                        style={{
                          padding: '10px 14px',
                          borderRadius: 999,
                          background: '#faf8f4',
                          border: '1px solid #e9e4db',
                          color: '#4c5564',
                          fontWeight: 900,
                          fontSize: 14,
                        }}
                      >
                        {labels.category}: {categoryLabel}
                      </div>

                      <div
                        style={{
                          padding: '10px 14px',
                          borderRadius: 999,
                          background: '#f1fbf4',
                          border: '1px solid #d6edde',
                          color: '#238a4f',
                          fontWeight: 900,
                          fontSize: 14,
                        }}
                      >
                        {formatMoney(price)}
                      </div>

                      {activeDiscountText ? (
                        <div
                          style={{
                            padding: '10px 14px',
                            borderRadius: 999,
                            background: '#fff5f5',
                            border: '1px solid #f3d7d4',
                            color: '#ff3b30',
                            fontWeight: 900,
                            fontSize: 14,
                          }}
                        >
                          {activeDiscountText}
                        </div>
                      ) : null}
                    </div>

                    <div
                      style={{
                        marginTop: 14,
                        fontSize: 13,
                        color: '#7b8390',
                        fontWeight: 700,
                      }}
                    >
                      {labels.validPeriod}: {durationDays}{' '}
                      {language === 'RU' ? 'дн.' : durationDays > 1 ? 'days' : 'day'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handleLaunchPromotion}
              disabled={isSubmitting}
              style={{
                height: 56,
                border: 'none',
                borderRadius: 18,
                background: '#2ea44f',
                color: '#fff',
                fontSize: 18,
                fontWeight: 900,
                cursor: 'pointer',
                boxShadow: '0 8px 20px rgba(46,164,79,0.24)',
                opacity: isSubmitting ? 0.8 : 1,
              }}
            >
              {isSubmitting ? labels.launching : labels.launchPromotion}
            </button>
          </div>
        </div>

        {archivedPromotions.length > 0 ? (
          <div>
            <div
              style={{
                fontSize: 18,
                fontWeight: 900,
                marginBottom: 10,
                color: '#202335',
              }}
            >
              {labels.previousPromotions}
            </div>

            <div style={{ display: 'grid', gap: 12 }}>
              {archivedPromotions.map((promo) => (
                <div
                  key={promo.id}
                  style={{
                    background: '#fff',
                    borderRadius: 24,
                    padding: 14,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
                    display: 'grid',
                    gridTemplateColumns: '88px 1fr',
                    gap: 12,
                    alignItems: 'center',
                  }}
                >
                  <img
                    src={promo.image}
                    alt={promo.title}
                    style={{
                      width: 88,
                      height: 88,
                      borderRadius: 18,
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />

                  <div>
                    <div
                      style={{
                        fontSize: 18,
                        fontWeight: 900,
                        lineHeight: 1.15,
                        color: '#202335',
                      }}
                    >
                      {promo.title}
                    </div>

                    <div
                      style={{
                        marginTop: 6,
                        fontSize: 13,
                        color: '#6f7782',
                        fontWeight: 700,
                      }}
                    >
                      {promo.subtitle || labels.specialOffer}
                    </div>

                    <div
                      style={{
                        marginTop: 8,
                        fontSize: 13,
                        color: '#6f7782',
                        fontWeight: 700,
                      }}
                    >
                      {formatDateLabel(promo.startAt)} → {formatDateLabel(promo.endAt)}
                    </div>

                    <div
                      style={{
                        marginTop: 8,
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 8,
                      }}
                    >
                      <span
                        style={{
                          padding: '7px 10px',
                          borderRadius: 999,
                          background: '#f8f9fb',
                          border: '1px solid #e5e7eb',
                          fontSize: 12,
                          fontWeight: 900,
                          color: '#1f2430',
                        }}
                      >
                        {labels.views}: {promo.views}
                      </span>

                      <button
                        onClick={() => handleResumePromotion(promo.id)}
                        style={{
                          padding: '7px 12px',
                          borderRadius: 999,
                          border: 'none',
                          background: '#2ea44f',
                          color: '#fff',
                          fontSize: 12,
                          fontWeight: 900,
                          cursor: 'pointer',
                        }}
                      >
                        {labels.relaunch}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}
