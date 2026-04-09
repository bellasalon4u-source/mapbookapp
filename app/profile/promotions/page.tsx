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

function formatMoney(value: number) {
  return `£${value.toFixed(0)}`;
}

function formatTimeLeft(endAt: string, language: string) {
  const end = new Date(endAt).getTime();
  const now = Date.now();
  const diff = Math.max(0, end - now);

  const totalMinutes = Math.floor(diff / 1000 / 60);
  const days = Math.floor(totalMinutes / 60 / 24);
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  if (language === 'RU') {
    if (days > 0) return `${days}д ${hours}ч осталось`;
    return `${hours}ч ${String(minutes).padStart(2, '0')}м осталось`;
  }

  if (days > 0) return `${days}d ${hours}h left`;
  return `${hours}h ${String(minutes).padStart(2, '0')}m left`;
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

    activeAds: isRu ? 'Активные' : 'Active',
    views: isRu ? 'Просмотры' : 'Views',
    bookings: isRu ? 'Брони' : 'Bookings',
    radius: isRu ? 'Радиус' : 'Radius',

    createPromotion: isRu ? 'Создать рекламу' : 'Create promotion',
    createPromotionSub: isRu ? 'Запустить новую рекламу' : 'Launch a new promotion',

    yourAds: isRu ? 'Ваши объявления' : 'Your ads',

    active: isRu ? 'Активна' : 'Active',
    inactive: isRu ? 'Неактивна' : 'Inactive',
    sponsored: 'Sponsored',

    relaunch: isRu ? 'Активировать повторно' : 'Activate again',
    relaunchDisabled: isRu ? 'Активировать повторно' : 'Activate again',

    expiredAgo: isRu ? 'Истекла' : 'Expired',
    close: isRu ? 'Закрыть' : 'Close',

    photoSectionTitle: isRu ? 'Фото рекламы' : 'Promotion photo',
    uploadMethods: isRu ? 'Способы загрузки' : 'Upload methods',
    takePhoto: isRu ? 'Сделать фото' : 'Take photo',
    chooseGallery: isRu ? 'Выбрать из галереи' : 'Choose from gallery',
    browseFiles: isRu ? 'Выбрать файл' : 'Browse files',
    useLink: isRu ? 'Вставить ссылку' : 'Use image link',
    replacePhoto: isRu ? 'Заменить фото' : 'Replace photo',
    removePhoto: isRu ? 'Удалить фото' : 'Remove photo',

    title: isRu ? 'Заголовок' : 'Title',
    titlePlaceholder: isRu ? 'Введите заголовок рекламы' : 'Enter promotion title',

    description: isRu ? 'Описание' : 'Description',
    descriptionPlaceholder: isRu
      ? 'Например: скидка 20% только на этой неделе'
      : 'Example: 20% off this week',

    category: isRu ? 'Категория' : 'Category',
    duration: isRu ? 'Длительность' : 'Duration',
    estimatedPrice: isRu ? 'Примерная цена' : 'Estimated price',
    promoPreview: isRu ? 'Предпросмотр рекламы' : 'Promotion preview',
    defaultPreviewText: isRu
      ? 'Так ваша реклама будет выглядеть в приложении'
      : 'This is how your promotion will look in the app',

    launchPromotion: isRu ? 'Запустить рекламу' : 'Launch promotion',
    launching: isRu ? 'Запускаем...' : 'Launching...',

    imageLinkPrompt: isRu ? 'Вставьте ссылку на изображение' : 'Paste image URL',
    noAdsYet: isRu ? 'Пока нет рекламных объявлений' : 'No ads yet',
    noAdsSub: isRu
      ? 'Создайте первую рекламу, чтобы она появилась здесь'
      : 'Create your first promotion to see it here',

    leftLabel: isRu ? 'осталось' : 'left',
    expired2: isRu ? 'Истекла' : 'Expired',
  };
}

function isPromotionActive(item: PromotionItem) {
  const now = Date.now();
  const start = new Date(item.startAt).getTime();
  const end = new Date(item.endAt).getTime();
  return item.status === 'active' && now >= start && now <= end;
}

function isPromotionExpired(item: PromotionItem) {
  const now = Date.now();
  const end = new Date(item.endAt).getTime();
  return end < now;
}

export default function PromotionsPage() {
  const router = useRouter();
  const masters = getAllMasters();

  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);
  const filesInputRef = useRef<HTMLInputElement | null>(null);

  const [language, setLanguage] = useState(getSavedLanguage());
  const [promotions, setPromotions] = useState<PromotionItem[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const [title, setTitle] = useState('Keratin Hair Extensions');
  const [description, setDescription] = useState('20% off this week');
  const [image, setImage] = useState(
    'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1200&q=80'
  );
  const [categoryId, setCategoryId] = useState('beauty');
  const [radiusKm, setRadiusKm] = useState(5);
  const [durationDays, setDurationDays] = useState(3);
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
    return promotions.filter((item) => isPromotionActive(item));
  }, [promotions]);

  const totalViews = useMemo(() => {
    return promotions.reduce((sum, item) => sum + (item.views || 0), 0);
  }, [promotions]);

  const totalBookings = 0;

  const maxRadius = useMemo(() => {
    if (promotions.length === 0) return 0;
    return Math.max(...promotions.map((item) => Number(item.radiusKm || 0)));
  }, [promotions]);

  const orderedPromotions = useMemo(() => {
    return [...promotions].sort((a, b) => {
      const aActive = isPromotionActive(a) ? 1 : 0;
      const bActive = isPromotionActive(b) ? 1 : 0;

      if (aActive !== bActive) return bActive - aActive;

      return new Date(b.createdAt || b.startAt).getTime() - new Date(a.createdAt || a.startAt).getTime();
    });
  }, [promotions]);

  const price = calcPromotionPrice(radiusKm, durationDays);
  const featuredMaster = masters[0];

  const categoryLabel =
    categories.find((item: any) => item.id === categoryId)?.label ||
    categories.find((item: any) => item.id === categoryId)?.id ||
    categoryId;

  const previewTitle = title.trim() || 'Keratin Hair Extensions';
  const previewDescription = description.trim() || (language === 'RU' ? 'Новая реклама' : 'New promotion');

  const readFile = (file: File) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      if (result) setImage(result);
    };

    reader.readAsDataURL(file);
  };

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      readFile(file);
    }
    event.target.value = '';
  };

  const handleUseLink = () => {
    const value = window.prompt(labels.imageLinkPrompt, image);
    if (value && value.trim()) {
      setImage(value.trim());
    }
  };

  const handleRemovePhoto = () => {
    setImage('');
  };

  const handleLaunchPromotion = () => {
    if (!previewTitle.trim()) return;
    if (!image.trim()) return;

    setIsSubmitting(true);

    const now = new Date();
    const end = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

    addPromotion({
      id: makeId(),
      masterId: String(featuredMaster?.id || 'master-1'),
      title: previewTitle.trim(),
      subtitle: previewDescription.trim(),
      image: image.trim(),
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
      setShowCreateForm(false);
      setTitle('Keratin Hair Extensions');
      setDescription('20% off this week');
      setRadiusKm(5);
      setDurationDays(3);
    }, 300);
  };

  const handleResumePromotion = (promotionId: string) => {
    const now = new Date();
    const end = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

    updatePromotion(promotionId, {
      status: 'active',
      startAt: now.toISOString(),
      endAt: end.toISOString(),
    });
  };

  const renderStatusBadge = (promo: PromotionItem) => {
    const active = isPromotionActive(promo);

    if (active) {
      return (
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: '#16a34a',
            color: '#fff',
            borderRadius: 999,
            padding: '9px 14px',
            fontSize: 14,
            fontWeight: 900,
          }}
        >
          <span>✓</span>
          <span>{labels.active}</span>
        </div>
      );
    }

    return (
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          background: '#ef4444',
          color: '#fff',
          borderRadius: 999,
          padding: '9px 14px',
          fontSize: 14,
          fontWeight: 900,
        }}
      >
        <span>✕</span>
        <span>{labels.inactive}</span>
      </div>
    );
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
        onChange={handleImageChange}
        style={{ display: 'none' }}
      />

      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        style={{ display: 'none' }}
      />

      <input
        ref={filesInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        style={{ display: 'none' }}
      />

      <div style={{ maxWidth: 430, margin: '0 auto' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '56px 1fr 56px',
            alignItems: 'center',
            gap: 12,
            marginBottom: 16,
          }}
        >
          <button
            onClick={() => router.back()}
            style={{
              width: 56,
              height: 56,
              borderRadius: 999,
              border: '1px solid #e8e1d7',
              background: '#ffffff',
              fontSize: 26,
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
                fontSize: 24,
                lineHeight: 1.05,
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
                lineHeight: 1.4,
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
              width: 56,
              height: 56,
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
            gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
            gap: 10,
            marginBottom: 14,
          }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: 18,
              padding: '14px 10px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.05)',
              border: '1px solid #f0eadf',
            }}
          >
            <div style={{ fontSize: 22, fontWeight: 900, color: '#16a34a' }}>{activePromotions.length}</div>
            <div style={{ marginTop: 4, fontSize: 12, fontWeight: 800, color: '#6f7782' }}>
              {labels.activeAds}
            </div>
          </div>

          <div
            style={{
              background: '#fff',
              borderRadius: 18,
              padding: '14px 10px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.05)',
              border: '1px solid #f0eadf',
            }}
          >
            <div style={{ fontSize: 22, fontWeight: 900, color: '#2563eb' }}>{totalViews}</div>
            <div style={{ marginTop: 4, fontSize: 12, fontWeight: 800, color: '#6f7782' }}>
              {labels.views}
            </div>
          </div>

          <div
            style={{
              background: '#fff',
              borderRadius: 18,
              padding: '14px 10px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.05)',
              border: '1px solid #f0eadf',
            }}
          >
            <div style={{ fontSize: 22, fontWeight: 900, color: '#16a34a' }}>{totalBookings}</div>
            <div style={{ marginTop: 4, fontSize: 12, fontWeight: 800, color: '#6f7782' }}>
              {labels.bookings}
            </div>
          </div>

          <div
            style={{
              background: '#fff',
              borderRadius: 18,
              padding: '14px 10px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.05)',
              border: '1px solid #f0eadf',
            }}
          >
            <div style={{ fontSize: 22, fontWeight: 900, color: '#ef4444' }}>
              {maxRadius > 0 ? `${maxRadius} km` : '0 km'}
            </div>
            <div style={{ marginTop: 4, fontSize: 12, fontWeight: 800, color: '#6f7782' }}>
              {labels.radius}
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowCreateForm((prev) => !prev)}
          style={{
            width: '100%',
            border: 'none',
            borderRadius: 22,
            background: '#ff1f1f',
            color: '#fff',
            padding: '18px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            cursor: 'pointer',
            boxShadow: '0 10px 24px rgba(255,31,31,0.22)',
            marginBottom: 18,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 999,
                background: 'rgba(255,255,255,0.14)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 28,
                fontWeight: 400,
              }}
            >
              +
            </div>

            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 24, fontWeight: 900 }}>{labels.createPromotion}</div>
              <div style={{ marginTop: 2, fontSize: 14, fontWeight: 700, opacity: 0.95 }}>
                {labels.createPromotionSub}
              </div>
            </div>
          </div>

          <div style={{ fontSize: 28, fontWeight: 900 }}>{showCreateForm ? '–' : '›'}</div>
        </button>

        {showCreateForm ? (
          <div
            style={{
              background: '#fff',
              borderRadius: 28,
              padding: 18,
              boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
              marginBottom: 22,
              border: '1px solid #efe6db',
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
              {labels.createPromotion}
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
                  }}
                >
                  {image ? (
                    <img
                      src={image}
                      alt="Preview"
                      style={{
                        width: '100%',
                        height: 210,
                        objectFit: 'cover',
                        display: 'block',
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        height: 210,
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
                    style={{
                      minHeight: 52,
                      borderRadius: 18,
                      border: '1px solid #f3d7d4',
                      background: '#fff5f5',
                      color: '#ff3b30',
                      fontSize: 15,
                      fontWeight: 900,
                      cursor: 'pointer',
                    }}
                  >
                    {labels.useLink}
                  </button>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 10,
                    marginTop: 10,
                  }}
                >
                  <button
                    onClick={() => galleryInputRef.current?.click()}
                    style={{
                      minHeight: 48,
                      borderRadius: 16,
                      border: '1px solid #e7dfd2',
                      background: '#ffffff',
                      color: '#1f2430',
                      fontSize: 14,
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
                  >
                    {labels.replacePhoto}
                  </button>

                  <button
                    onClick={handleRemovePhoto}
                    style={{
                      minHeight: 48,
                      borderRadius: 16,
                      border: '1px solid #f1d9d9',
                      background: '#fffafa',
                      color: '#c53d35',
                      fontSize: 14,
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
                  >
                    {labels.removePhoto}
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

                <input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={labels.descriptionPlaceholder}
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
                      {item.label || item.id}
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
                  {labels.duration}
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
                  {radiusKm} km • {durationDays} {language === 'RU' ? 'дн.' : durationDays > 1 ? 'days' : 'day'}
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
                      <img
                        src={
                          image.trim()
                            ? image
                            : 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1200&q=80'
                        }
                        alt={previewTitle}
                        style={{
                          width: '100%',
                          height: 180,
                          objectFit: 'cover',
                          display: 'block',
                        }}
                      />

                      <div
                        style={{
                          position: 'absolute',
                          top: 14,
                          right: 14,
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
                          fontSize: 28,
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
                          display: 'grid',
                          gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                          gap: 10,
                          marginTop: 14,
                        }}
                      >
                        <div
                          style={{
                            borderRadius: 16,
                            border: '1px solid #ece6dd',
                            background: '#fff',
                            padding: '12px 10px',
                          }}
                        >
                          <div style={{ fontSize: 12, fontWeight: 800, color: '#7b8390' }}>
                            {labels.views}
                          </div>
                          <div style={{ marginTop: 4, fontSize: 22, fontWeight: 900, color: '#2563eb' }}>0</div>
                        </div>

                        <div
                          style={{
                            borderRadius: 16,
                            border: '1px solid #ece6dd',
                            background: '#fff',
                            padding: '12px 10px',
                          }}
                        >
                          <div style={{ fontSize: 12, fontWeight: 800, color: '#7b8390' }}>
                            {labels.bookings}
                          </div>
                          <div style={{ marginTop: 4, fontSize: 22, fontWeight: 900, color: '#16a34a' }}>0</div>
                        </div>

                        <div
                          style={{
                            borderRadius: 16,
                            border: '1px solid #ece6dd',
                            background: '#fff',
                            padding: '12px 10px',
                          }}
                        >
                          <div style={{ fontSize: 12, fontWeight: 800, color: '#7b8390' }}>
                            {labels.radius}
                          </div>
                          <div style={{ marginTop: 4, fontSize: 22, fontWeight: 900, color: '#ef4444' }}>
                            {radiusKm} km
                          </div>
                        </div>
                      </div>

                      <div
                        style={{
                          marginTop: 12,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 10,
                        }}
                      >
                        <div
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 8,
                            background: '#16a34a',
                            color: '#fff',
                            borderRadius: 999,
                            padding: '10px 14px',
                            fontSize: 14,
                            fontWeight: 900,
                          }}
                        >
                          <span>✓</span>
                          <span>{labels.active}</span>
                        </div>

                        <div
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 8,
                            border: '2px solid #dcfce7',
                            color: '#16a34a',
                            background: '#f0fdf4',
                            borderRadius: 999,
                            padding: '10px 14px',
                            fontSize: 14,
                            fontWeight: 900,
                          }}
                        >
                          {durationDays} {language === 'RU' ? 'дн.' : durationDays > 1 ? 'days' : 'day'}
                        </div>
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
                  background: '#16a34a',
                  color: '#fff',
                  fontSize: 18,
                  fontWeight: 900,
                  cursor: 'pointer',
                  boxShadow: '0 8px 20px rgba(22,163,74,0.24)',
                  opacity: isSubmitting ? 0.8 : 1,
                }}
              >
                {isSubmitting ? labels.launching : labels.launchPromotion}
              </button>
            </div>
          </div>
        ) : null}

        <div
          style={{
            fontSize: 22,
            fontWeight: 900,
            color: '#202335',
            marginBottom: 12,
          }}
        >
          {labels.yourAds}
        </div>

        {orderedPromotions.length === 0 ? (
          <div
            style={{
              background: '#fff',
              borderRadius: 24,
              padding: 22,
              boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
              border: '1px solid #efe6db',
            }}
          >
            <div style={{ fontSize: 18, fontWeight: 900, color: '#202335' }}>{labels.noAdsYet}</div>
            <div style={{ marginTop: 6, fontSize: 14, lineHeight: 1.45, color: '#7b8390', fontWeight: 700 }}>
              {labels.noAdsSub}
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 16 }}>
            {orderedPromotions.map((promo) => {
              const active = isPromotionActive(promo);
              const expired = isPromotionExpired(promo);

              return (
                <div
                  key={promo.id}
                  style={{
                    background: '#fff',
                    borderRadius: 28,
                    overflow: 'hidden',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
                    border: '1px solid #efe6db',
                  }}
                >
                  <div style={{ padding: 14, paddingBottom: 0 }}>
                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 10,
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: 12,
                      }}
                    >
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
                        {renderStatusBadge(promo)}

                        <div
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 8,
                            borderRadius: 999,
                            padding: '9px 14px',
                            fontSize: 14,
                            fontWeight: 900,
                            border: active ? '2px solid #dcfce7' : '2px solid #fecaca',
                            background: active ? '#f0fdf4' : '#fff1f2',
                            color: active ? '#16a34a' : '#ef4444',
                          }}
                        >
                          <span>{active ? '⏱' : '○'}</span>
                          <span>
                            {active
                              ? formatTimeLeft(promo.endAt, language)
                              : expired
                              ? language === 'RU'
                                ? 'Истекла'
                                : 'Expired'
                              : language === 'RU'
                              ? 'Остановлена'
                              : 'Stopped'}
                          </span>
                        </div>
                      </div>

                      <div
                        style={{
                          background: '#fff',
                          color: '#ff4f93',
                          borderRadius: 999,
                          padding: '9px 14px',
                          fontSize: 12,
                          fontWeight: 900,
                          border: '1px solid #f4d8e8',
                        }}
                      >
                        {labels.sponsored}
                      </div>
                    </div>
                  </div>

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

                  <div style={{ padding: 16 }}>
                    <div
                      style={{
                        fontSize: 26,
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
                        lineHeight: 1.45,
                        color: '#717987',
                        fontWeight: 700,
                      }}
                    >
                      {promo.subtitle || (language === 'RU' ? 'Описание рекламы' : 'Promotion description')}
                    </div>

                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                        gap: 10,
                        marginTop: 14,
                      }}
                    >
                      <div
                        style={{
                          borderRadius: 16,
                          border: '1px solid #ece6dd',
                          background: '#fff',
                          padding: '12px 10px',
                        }}
                      >
                        <div style={{ fontSize: 12, fontWeight: 800, color: '#7b8390' }}>{labels.views}</div>
                        <div style={{ marginTop: 4, fontSize: 22, fontWeight: 900, color: '#2563eb' }}>
                          {promo.views || 0}
                        </div>
                      </div>

                      <div
                        style={{
                          borderRadius: 16,
                          border: '1px solid #ece6dd',
                          background: '#fff',
                          padding: '12px 10px',
                        }}
                      >
                        <div style={{ fontSize: 12, fontWeight: 800, color: '#7b8390' }}>{labels.bookings}</div>
                        <div style={{ marginTop: 4, fontSize: 22, fontWeight: 900, color: '#16a34a' }}>0</div>
                      </div>

                      <div
                        style={{
                          borderRadius: 16,
                          border: '1px solid #ece6dd',
                          background: '#fff',
                          padding: '12px 10px',
                        }}
                      >
                        <div style={{ fontSize: 12, fontWeight: 800, color: '#7b8390' }}>{labels.radius}</div>
                        <div style={{ marginTop: 4, fontSize: 22, fontWeight: 900, color: '#ef4444' }}>
                          {promo.radiusKm} km
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        if (!active) handleResumePromotion(promo.id);
                      }}
                      disabled={active}
                      style={{
                        width: '100%',
                        height: 54,
                        marginTop: 16,
                        borderRadius: 18,
                        border: active ? '1px solid #d9dde3' : 'none',
                        background: active ? '#eef1f5' : '#16a34a',
                        color: active ? '#9aa2af' : '#fff',
                        fontSize: 17,
                        fontWeight: 900,
                        cursor: active ? 'not-allowed' : 'pointer',
                      }}
                    >
                      {active ? labels.relaunchDisabled : labels.relaunch}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
