'use client';

import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { categories } from '../../../../services/categories';
import { getSavedLanguage } from '../../../../services/i18n';

const radiusOptions = [1, 3, 5, 10, 15, 25];
const durationOptions = [1, 3, 7, 14];
const MAX_PHOTOS = 4;

type AppLang = 'RU' | 'EN' | 'ES';

type PromoPhoto = {
  id: string;
  src: string;
  zoom: number;
  rotate: number;
  offsetX: number;
  offsetY: number;
};

function makeId(prefix = 'id') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function formatMoney(value: number) {
  return `£${value.toFixed(0)}`;
}

function calcPromotionPrice(radiusKm: number, days: number) {
  const base = 6;
  const radiusPart = radiusKm * 1.6;
  const durationPart = days * 3.5;
  return Math.round(base + radiusPart + durationPart);
}

function normalizeLanguage(value: string): AppLang {
  if (value === 'RU' || value === 'EN' || value === 'ES') return value;
  return 'EN';
}

function getLabels(language: AppLang) {
  if (language === 'RU') {
    return {
      pageTitle: 'Новая реклама',
      photosTitle: 'Фото рекламы',
      photosHint: 'Добавьте от 1 до 4 фото',
      camera: 'Камера',
      gallery: 'Галерея',
      files: 'Файлы',
      addPhoto: 'Добавить фото',
      dragHint: 'Нажмите по фото, чтобы редактировать. Первое фото будет главным.',
      title: 'Заголовок',
      titlePlaceholder: 'Например: Keratin Hair Extensions',
      description: 'Описание',
      descriptionPlaceholder: 'Опишите предложение коротко и понятно',
      discount: 'Скидка',
      discountOptional: '(необязательно)',
      percent: '%',
      category: 'Категория',
      radius: 'Радиус показа',
      duration: 'Длительность',
      day1: '1 день',
      days: 'дней',
      estimatedPrice: 'Примерная цена',
      preview: 'Предпросмотр',
      views: 'Просмотры',
      bookings: 'Брони',
      radiusShort: 'Радиус',
      active: 'Активна',
      sponsored: 'Sponsored',
      goToPayment: 'Перейти к оплате',
      selectPhotoFirst: 'Сначала добавьте хотя бы одно фото',
      editPhoto: 'Редактирование фото',
      editorHint: 'Сдвигайте, масштабируйте и вращайте фото',
      zoom: 'Масштаб',
      position: 'Позиция',
      rotate: 'Поворот',
      done: 'Готово',
      close: 'Закрыть',
      back: 'Назад',
      subtitlePreviewDefault: 'Специальное предложение',
      categoryBeauty: 'Beauty',
      removePhoto: 'Удалить фото',
      paymentDraftSaved: 'Черновик рекламы сохранён',
    };
  }

  if (language === 'ES') {
    return {
      pageTitle: 'Nuevo anuncio',
      photosTitle: 'Fotos del anuncio',
      photosHint: 'Añade de 1 a 4 fotos',
      camera: 'Cámara',
      gallery: 'Galería',
      files: 'Archivos',
      addPhoto: 'Añadir foto',
      dragHint: 'Toca una foto para editarla. La primera será la principal.',
      title: 'Título',
      titlePlaceholder: 'Por ejemplo: Keratin Hair Extensions',
      description: 'Descripción',
      descriptionPlaceholder: 'Describe la oferta de forma clara y breve',
      discount: 'Descuento',
      discountOptional: '(opcional)',
      percent: '%',
      category: 'Categoría',
      radius: 'Radio',
      duration: 'Duración',
      day1: '1 día',
      days: 'días',
      estimatedPrice: 'Precio estimado',
      preview: 'Vista previa',
      views: 'Vistas',
      bookings: 'Reservas',
      radiusShort: 'Radio',
      active: 'Activa',
      sponsored: 'Sponsored',
      goToPayment: 'Ir al pago',
      selectPhotoFirst: 'Primero añade al menos una foto',
      editPhoto: 'Editar foto',
      editorHint: 'Mueve, amplía y gira la foto',
      zoom: 'Zoom',
      position: 'Posición',
      rotate: 'Giro',
      done: 'Listo',
      close: 'Cerrar',
      back: 'Atrás',
      subtitlePreviewDefault: 'Oferta especial',
      categoryBeauty: 'Beauty',
      removePhoto: 'Eliminar foto',
      paymentDraftSaved: 'Borrador del anuncio guardado',
    };
  }

  return {
    pageTitle: 'New promotion',
    photosTitle: 'Promotion photos',
    photosHint: 'Add from 1 to 4 photos',
    camera: 'Camera',
    gallery: 'Gallery',
    files: 'Files',
    addPhoto: 'Add photo',
    dragHint: 'Tap a photo to edit it. The first photo will be the main one.',
    title: 'Title',
    titlePlaceholder: 'For example: Keratin Hair Extensions',
    description: 'Description',
    descriptionPlaceholder: 'Describe the offer clearly and briefly',
    discount: 'Discount',
    discountOptional: '(optional)',
    percent: '%',
    category: 'Category',
    radius: 'Radius',
    duration: 'Duration',
    day1: '1 day',
    days: 'days',
    estimatedPrice: 'Estimated price',
    preview: 'Preview',
    views: 'Views',
    bookings: 'Bookings',
    radiusShort: 'Radius',
    active: 'Active',
    sponsored: 'Sponsored',
    goToPayment: 'Go to payment',
    selectPhotoFirst: 'Add at least one photo first',
    editPhoto: 'Edit photo',
    editorHint: 'Move, zoom and rotate the photo',
    zoom: 'Zoom',
    position: 'Position',
    rotate: 'Rotate',
    done: 'Done',
    close: 'Close',
    back: 'Back',
    subtitlePreviewDefault: 'Special offer',
    categoryBeauty: 'Beauty',
    removePhoto: 'Remove photo',
    paymentDraftSaved: 'Promotion draft saved',
  };
}

function getCategoryLabel(item: { id: string; label?: string }) {
  return item.label || item.id;
}

function getPhotoTransform(photo: PromoPhoto) {
  return `translate(${photo.offsetX}px, ${photo.offsetY}px) scale(${photo.zoom}) rotate(${photo.rotate}deg)`;
}

export default function NewPromotionPage() {
  const router = useRouter();

  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);
  const filesInputRef = useRef<HTMLInputElement | null>(null);

  const [language, setLanguage] = useState<AppLang>(normalizeLanguage(getSavedLanguage()));
  const [photos, setPhotos] = useState<PromoPhoto[]>([]);
  const [editingPhotoId, setEditingPhotoId] = useState<string | null>(null);

  const [title, setTitle] = useState('Keratin Hair Extensions');
  const [description, setDescription] = useState(
    language === 'RU'
      ? 'Профессиональное наращивание волос с кератином. Блеск, длина и объём на месяцы вперёд.'
      : 'Professional keratin hair extensions. Shine, length and volume for months ahead.'
  );
  const [discountEnabled, setDiscountEnabled] = useState(true);
  const [discountPercent, setDiscountPercent] = useState('20');
  const [categoryId, setCategoryId] = useState('beauty');
  const [radiusKm, setRadiusKm] = useState(5);
  const [durationDays, setDurationDays] = useState(3);

  const labels = getLabels(language);

  useEffect(() => {
    const syncLanguage = () => {
      setLanguage(normalizeLanguage(getSavedLanguage()));
    };

    syncLanguage();

    window.addEventListener('focus', syncLanguage);
    window.addEventListener('storage', syncLanguage);

    return () => {
      window.removeEventListener('focus', syncLanguage);
      window.removeEventListener('storage', syncLanguage);
    };
  }, []);

  const activePhoto = useMemo(() => {
    return photos.find((item) => item.id === editingPhotoId) || null;
  }, [editingPhotoId, photos]);

  const price = useMemo(() => {
    return calcPromotionPrice(radiusKm, durationDays);
  }, [radiusKm, durationDays]);

  const categoryLabel = useMemo(() => {
    return (
      categories.find((item) => item.id === categoryId)?.label ||
      labels.categoryBeauty
    );
  }, [categoryId, labels.categoryBeauty]);

  const previewTitle = title.trim() || 'Keratin Hair Extensions';
  const previewDescription = description.trim() || labels.subtitlePreviewDefault;
  const previewDiscountText =
    discountEnabled && discountPercent.trim() ? `-${discountPercent.trim()}%` : '';

  const addFilesToPhotos = (fileList: FileList | null) => {
    if (!fileList) return;

    const files = Array.from(fileList).slice(0, MAX_PHOTOS - photos.length);
    if (!files.length) return;

    files.forEach((file) => {
      const reader = new FileReader();

      reader.onload = () => {
        const result = typeof reader.result === 'string' ? reader.result : '';
        if (!result) return;

        setPhotos((prev) => {
          if (prev.length >= MAX_PHOTOS) return prev;

          return [
            ...prev,
            {
              id: makeId('photo'),
              src: result,
              zoom: 1,
              rotate: 0,
              offsetX: 0,
              offsetY: 0,
            },
          ];
        });
      };

      reader.readAsDataURL(file);
    });
  };

  const handlePhotoInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    addFilesToPhotos(event.target.files);
    event.target.value = '';
  };

  const removePhoto = (photoId: string) => {
    setPhotos((prev) => prev.filter((item) => item.id !== photoId));
    if (editingPhotoId === photoId) {
      setEditingPhotoId(null);
    }
  };

  const openEditor = (photoId: string) => {
    setEditingPhotoId(photoId);
  };

  const updatePhoto = (photoId: string, patch: Partial<PromoPhoto>) => {
    setPhotos((prev) =>
      prev.map((item) => (item.id === photoId ? { ...item, ...patch } : item))
    );
  };

  const movePhoto = (fromIndex: number, toIndex: number) => {
    setPhotos((prev) => {
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  };

  const goToPayment = () => {
    if (!photos.length) {
      window.alert(labels.selectPhotoFirst);
      return;
    }

    const payload = {
      title: previewTitle,
      description: previewDescription,
      discountEnabled,
      discountPercent,
      categoryId,
      radiusKm,
      durationDays,
      price,
      photos,
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem('promotionDraft', JSON.stringify(payload));
    router.push('/profile/promotions/payment');
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#f7f3eb',
        padding: '18px 14px 40px',
        fontFamily: 'Arial, sans-serif',
        color: '#171b2e',
      }}
    >
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        onChange={handlePhotoInputChange}
        style={{ display: 'none' }}
      />

      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handlePhotoInputChange}
        style={{ display: 'none' }}
      />

      <input
        ref={filesInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handlePhotoInputChange}
        style={{ display: 'none' }}
      />

      <div style={{ maxWidth: 460, margin: '0 auto' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '54px 1fr 54px',
            alignItems: 'center',
            gap: 12,
            marginBottom: 16,
          }}
        >
          <button
            onClick={() => router.back()}
            style={{
              width: 54,
              height: 54,
              borderRadius: 999,
              border: '1px solid #e5ded2',
              background: '#fff',
              fontSize: 28,
              color: '#1b2033',
              cursor: 'pointer',
            }}
            title={labels.back}
          >
            ‹
          </button>

          <div
            style={{
              textAlign: 'center',
              fontWeight: 900,
              fontSize: 20,
              color: '#161a2e',
            }}
          >
            {labels.pageTitle}
          </div>

          <button
            onClick={() => router.push('/profile/promotions')}
            style={{
              width: 54,
              height: 54,
              borderRadius: 999,
              border: '1px solid #e5ded2',
              background: '#fff',
              fontSize: 28,
              color: '#1b2033',
              cursor: 'pointer',
            }}
            title={labels.close}
          >
            ×
          </button>
        </div>

        <div
          style={{
            background: '#fff',
            borderRadius: 28,
            padding: 16,
            boxShadow: '0 10px 28px rgba(0,0,0,0.06)',
            border: '1px solid #f0e8dc',
          }}
        >
          <div style={{ fontSize: 15, fontWeight: 900, marginBottom: 4 }}>
            {labels.photosTitle}
          </div>
          <div style={{ fontSize: 13, color: '#727b88', marginBottom: 12, fontWeight: 700 }}>
            {labels.photosHint}
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: photos.length > 0 ? '1.45fr 1fr' : '1fr',
              gap: 10,
              marginBottom: 12,
            }}
          >
            {photos.length > 0 ? (
              <>
                <div
                  onClick={() => openEditor(photos[0].id)}
                  style={{
                    position: 'relative',
                    minHeight: 250,
                    borderRadius: 20,
                    overflow: 'hidden',
                    background: '#f3f4f6',
                    cursor: 'pointer',
                    border: '1px solid #ebe4d8',
                  }}
                >
                  <img
                    src={photos[0].src}
                    alt="Main"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                      transform: getPhotoTransform(photos[0]),
                    }}
                  />

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removePhoto(photos[0].id);
                    }}
                    style={{
                      position: 'absolute',
                      top: 10,
                      right: 10,
                      width: 34,
                      height: 34,
                      borderRadius: 999,
                      border: 'none',
                      background: '#fff',
                      color: '#1b2033',
                      fontSize: 24,
                      cursor: 'pointer',
                      boxShadow: '0 6px 18px rgba(0,0,0,0.12)',
                    }}
                    title={labels.removePhoto}
                  >
                    ×
                  </button>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateRows: '1fr 1fr auto',
                    gap: 10,
                  }}
                >
                  {[1, 2].map((index) => {
                    const photo = photos[index];

                    if (!photo) {
                      return (
                        <div
                          key={`empty-${index}`}
                          style={{
                            minHeight: 78,
                            borderRadius: 18,
                            border: '1px dashed #d9d2c7',
                            background: '#faf9f7',
                          }}
                        />
                      );
                    }

                    return (
                      <div
                        key={photo.id}
                        onClick={() => openEditor(photo.id)}
                        style={{
                          position: 'relative',
                          minHeight: 78,
                          borderRadius: 18,
                          overflow: 'hidden',
                          background: '#f3f4f6',
                          cursor: 'pointer',
                          border: '1px solid #ebe4d8',
                        }}
                      >
                        <img
                          src={photo.src}
                          alt="Extra"
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            display: 'block',
                            transform: getPhotoTransform(photo),
                          }}
                        />

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removePhoto(photo.id);
                          }}
                          style={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            width: 30,
                            height: 30,
                            borderRadius: 999,
                            border: 'none',
                            background: '#fff',
                            color: '#1b2033',
                            fontSize: 22,
                            cursor: 'pointer',
                          }}
                          title={labels.removePhoto}
                        >
                          ×
                        </button>
                      </div>
                    );
                  })}

                  {photos[3] ? (
                    <div
                      onClick={() => openEditor(photos[3].id)}
                      style={{
                        position: 'relative',
                        minHeight: 88,
                        borderRadius: 18,
                        overflow: 'hidden',
                        background: '#f3f4f6',
                        cursor: 'pointer',
                        border: '1px solid #ebe4d8',
                      }}
                    >
                      <img
                        src={photos[3].src}
                        alt="Extra"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          display: 'block',
                          transform: getPhotoTransform(photos[3]),
                        }}
                      />

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removePhoto(photos[3].id);
                        }}
                        style={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          width: 30,
                          height: 30,
                          borderRadius: 999,
                          border: 'none',
                          background: '#fff',
                          color: '#1b2033',
                          fontSize: 22,
                          cursor: 'pointer',
                        }}
                        title={labels.removePhoto}
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => galleryInputRef.current?.click()}
                      disabled={photos.length >= MAX_PHOTOS}
                      style={{
                        minHeight: 88,
                        borderRadius: 18,
                        border: '1px dashed #d9d2c7',
                        background: '#faf9f7',
                        color: '#171b2e',
                        fontWeight: 900,
                        fontSize: 17,
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ fontSize: 34, lineHeight: 1 }}>+</div>
                      <div style={{ fontSize: 14 }}>{labels.addPhoto}</div>
                    </button>
                  )}
                </div>
              </>
            ) : (
              <button
                onClick={() => galleryInputRef.current?.click()}
                style={{
                  minHeight: 240,
                  borderRadius: 22,
                  border: '1px dashed #d9d2c7',
                  background: '#faf9f7',
                  color: '#171b2e',
                  fontWeight: 900,
                  fontSize: 18,
                  cursor: 'pointer',
                }}
              >
                <div style={{ fontSize: 42, lineHeight: 1, marginBottom: 8 }}>+</div>
                <div>{labels.addPhoto}</div>
              </button>
            )}
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
              gap: 10,
              marginBottom: 10,
            }}
          >
            <button
              onClick={() => cameraInputRef.current?.click()}
              style={{
                minHeight: 50,
                borderRadius: 16,
                border: '1px solid #d8eadb',
                background: '#eef8f0',
                color: '#2f8b48',
                fontSize: 15,
                fontWeight: 900,
                cursor: 'pointer',
              }}
            >
              📷 {labels.camera}
            </button>

            <button
              onClick={() => galleryInputRef.current?.click()}
              style={{
                minHeight: 50,
                borderRadius: 16,
                border: '1px solid #ddd6cb',
                background: '#fff',
                color: '#171b2e',
                fontSize: 15,
                fontWeight: 900,
                cursor: 'pointer',
              }}
            >
              🖼️ {labels.gallery}
            </button>

            <button
              onClick={() => filesInputRef.current?.click()}
              style={{
                minHeight: 50,
                borderRadius: 16,
                border: '1px solid #ddd6cb',
                background: '#fff',
                color: '#171b2e',
                fontSize: 15,
                fontWeight: 900,
                cursor: 'pointer',
              }}
            >
              📁 {labels.files}
            </button>
          </div>

          <div
            style={{
              textAlign: 'center',
              fontSize: 13,
              color: '#7a8290',
              fontWeight: 700,
              marginBottom: 16,
            }}
          >
            {labels.dragHint}
          </div>

          <div style={{ display: 'grid', gap: 14 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 900, marginBottom: 8 }}>{labels.title}</div>
              <div style={{ position: 'relative' }}>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value.slice(0, 60))}
                  placeholder={labels.titlePlaceholder}
                  style={{
                    width: '100%',
                    height: 54,
                    borderRadius: 16,
                    border: '1px solid #ddd6cb',
                    padding: '0 14px',
                    fontSize: 16,
                    outline: 'none',
                    color: '#171b2e',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    right: 12,
                    bottom: 8,
                    fontSize: 12,
                    color: '#a0a8b5',
                    fontWeight: 700,
                  }}
                >
                  {title.length}/60
                </div>
              </div>
            </div>

            <div>
              <div style={{ fontSize: 14, fontWeight: 900, marginBottom: 8 }}>
                {labels.description}
              </div>
              <div style={{ position: 'relative' }}>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value.slice(0, 150))}
                  placeholder={labels.descriptionPlaceholder}
                  rows={3}
                  style={{
                    width: '100%',
                    borderRadius: 16,
                    border: '1px solid #ddd6cb',
                    padding: '14px',
                    fontSize: 16,
                    outline: 'none',
                    color: '#171b2e',
                    resize: 'none',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    right: 12,
                    bottom: 8,
                    fontSize: 12,
                    color: '#a0a8b5',
                    fontWeight: 700,
                  }}
                >
                  {description.length}/150
                </div>
              </div>
            </div>

            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                  marginBottom: 10,
                }}
              >
                <div style={{ fontSize: 14, fontWeight: 900 }}>
                  {labels.discount} <span style={{ color: '#727b88' }}>{labels.discountOptional}</span>
                </div>

                <button
                  onClick={() => setDiscountEnabled((prev) => !prev)}
                  style={{
                    width: 58,
                    height: 32,
                    borderRadius: 999,
                    border: 'none',
                    background: discountEnabled ? '#2ea44f' : '#d7dce3',
                    position: 'relative',
                    cursor: 'pointer',
                  }}
                >
                  <span
                    style={{
                      position: 'absolute',
                      top: 3,
                      left: discountEnabled ? 29 : 3,
                      width: 26,
                      height: 26,
                      borderRadius: 999,
                      background: '#fff',
                      transition: 'all 0.2s ease',
                    }}
                  />
                </button>
              </div>

              {discountEnabled ? (
                <div
                  style={{
                    background: '#f2faf4',
                    border: '1px solid #dcecdf',
                    borderRadius: 16,
                    padding: 10,
                    display: 'grid',
                    gridTemplateColumns: '110px 90px 50px',
                    gap: 8,
                    alignItems: 'center',
                  }}
                >
                  <div
                    style={{
                      height: 46,
                      borderRadius: 12,
                      background: '#fff',
                      border: '1px solid #dde3d9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                    }}
                  >
                    {labels.discount}
                  </div>

                  <input
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(e.target.value.replace(/\D/g, '').slice(0, 2))}
                    style={{
                      width: '100%',
                      height: 46,
                      borderRadius: 12,
                      border: '1px solid #dde3d9',
                      background: '#fff',
                      padding: '0 12px',
                      fontSize: 16,
                      outline: 'none',
                    }}
                  />

                  <div
                    style={{
                      height: 46,
                      borderRadius: 12,
                      background: '#fff',
                      border: '1px solid #dde3d9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 900,
                    }}
                  >
                    {labels.percent}
                  </div>
                </div>
              ) : null}
            </div>

            <div>
              <div style={{ fontSize: 14, fontWeight: 900, marginBottom: 8 }}>{labels.category}</div>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                style={{
                  width: '100%',
                  height: 54,
                  borderRadius: 16,
                  border: '1px solid #ddd6cb',
                  padding: '0 14px',
                  fontSize: 16,
                  outline: 'none',
                  background: '#fff',
                  color: '#171b2e',
                }}
              >
                {categories.map((item) => (
                  <option key={item.id} value={item.id}>
                    {getCategoryLabel(item)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div style={{ fontSize: 14, fontWeight: 900, marginBottom: 8 }}>{labels.radius}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {radiusOptions.map((item) => (
                  <button
                    key={item}
                    onClick={() => setRadiusKm(item)}
                    style={{
                      minWidth: 74,
                      height: 42,
                      borderRadius: 999,
                      border: radiusKm === item ? '2px solid #ff5a53' : '1px solid #ddd6cb',
                      background: '#fff',
                      color: radiusKm === item ? '#ff4a43' : '#171b2e',
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
              <div style={{ fontSize: 14, fontWeight: 900, marginBottom: 8 }}>{labels.duration}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {durationOptions.map((item) => (
                  <button
                    key={item}
                    onClick={() => setDurationDays(item)}
                    style={{
                      minWidth: 86,
                      height: 42,
                      borderRadius: 999,
                      border: durationDays === item ? '2px solid #ff5a53' : '1px solid #ddd6cb',
                      background: '#fff',
                      color: durationDays === item ? '#ff4a43' : '#171b2e',
                      fontWeight: 900,
                      fontSize: 14,
                      cursor: 'pointer',
                    }}
                  >
                    {language === 'RU'
                      ? item === 1
                        ? labels.day1
                        : `${item} ${labels.days}`
                      : item === 1
                        ? labels.day1
                        : `${item} ${labels.days}`}
                  </button>
                ))}
              </div>
            </div>

            <div
              style={{
                background: '#fff4f4',
                border: '1px solid #f0d7d7',
                borderRadius: 18,
                padding: 14,
                display: 'grid',
                gridTemplateColumns: '1fr auto',
                alignItems: 'end',
                gap: 12,
              }}
            >
              <div>
                <div style={{ fontSize: 13, color: '#727b88', fontWeight: 800 }}>
                  {labels.estimatedPrice}
                </div>
                <div style={{ marginTop: 6, fontSize: 34, fontWeight: 900, color: '#ff5a53' }}>
                  {formatMoney(price)}
                </div>
              </div>

              <div
                style={{
                  fontSize: 14,
                  color: '#727b88',
                  fontWeight: 800,
                  whiteSpace: 'nowrap',
                }}
              >
                {radiusKm} km • {durationDays}{' '}
                {language === 'RU'
                  ? durationDays === 1
                    ? 'день'
                    : 'дн.'
                  : durationDays === 1
                    ? 'day'
                    : 'days'}
              </div>
            </div>

            <div>
              <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 10 }}>{labels.preview}</div>

              <div
                style={{
                  borderRadius: 22,
                  overflow: 'hidden',
                  border: '1px solid #eee5da',
                  background: '#fff',
                  boxShadow: '0 10px 24px rgba(0,0,0,0.05)',
                }}
              >
                <div style={{ display: 'flex', gap: 0, height: 120, background: '#f3f4f6' }}>
                  {photos.length > 0 ? (
                    <>
                      <div style={{ flex: photos.length === 1 ? 1 : 1.3, overflow: 'hidden' }}>
                        <img
                          src={photos[0].src}
                          alt="Preview main"
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            display: 'block',
                            transform: getPhotoTransform(photos[0]),
                          }}
                        />
                      </div>

                      {photos.length > 1 ? (
                        <div
                          style={{
                            flex: 1,
                            display: 'grid',
                            gridTemplateRows: photos.length >= 4 ? '1fr 1fr' : '1fr',
                            gap: 0,
                          }}
                        >
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
                            {photos[1] ? (
                              <img
                                src={photos[1].src}
                                alt="Preview extra"
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover',
                                  display: 'block',
                                  transform: getPhotoTransform(photos[1]),
                                }}
                              />
                            ) : (
                              <div />
                            )}

                            {photos[2] ? (
                              <img
                                src={photos[2].src}
                                alt="Preview extra"
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover',
                                  display: 'block',
                                  transform: getPhotoTransform(photos[2]),
                                }}
                              />
                            ) : (
                              <div />
                            )}
                          </div>

                          {photos[3] ? (
                            <img
                              src={photos[3].src}
                              alt="Preview extra"
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                display: 'block',
                                transform: getPhotoTransform(photos[3]),
                              }}
                            />
                          ) : null}
                        </div>
                      ) : null}
                    </>
                  ) : (
                    <div
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#a0a8b5',
                        fontWeight: 800,
                      }}
                    >
                      {labels.photosHint}
                    </div>
                  )}
                </div>

                <div style={{ padding: 14 }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      gap: 10,
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontSize: 22,
                          lineHeight: 1.05,
                          fontWeight: 900,
                          color: '#161a2e',
                        }}
                      >
                        {previewTitle}
                      </div>

                      <div
                        style={{
                          marginTop: 8,
                          fontSize: 14,
                          lineHeight: 1.35,
                          color: '#727b88',
                          fontWeight: 700,
                        }}
                      >
                        {previewDescription}
                      </div>
                    </div>

                    {previewDiscountText ? (
                      <div
                        style={{
                          minWidth: 56,
                          height: 36,
                          borderRadius: 999,
                          background: '#fff2f7',
                          color: '#ff4f93',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 900,
                          fontSize: 14,
                          padding: '0 10px',
                        }}
                      >
                        {previewDiscountText}
                      </div>
                    ) : null}
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                      gap: 8,
                      marginTop: 12,
                    }}
                  >
                    <div
                      style={{
                        border: '1px solid #e8e2d7',
                        borderRadius: 16,
                        padding: 10,
                        background: '#fff',
                      }}
                    >
                      <div style={{ fontSize: 12, color: '#7a8290', fontWeight: 800 }}>
                        {labels.views}
                      </div>
                      <div style={{ marginTop: 6, fontSize: 16, color: '#2f63d8', fontWeight: 900 }}>
                        0
                      </div>
                    </div>

                    <div
                      style={{
                        border: '1px solid #e8e2d7',
                        borderRadius: 16,
                        padding: 10,
                        background: '#fff',
                      }}
                    >
                      <div style={{ fontSize: 12, color: '#7a8290', fontWeight: 800 }}>
                        {labels.bookings}
                      </div>
                      <div style={{ marginTop: 6, fontSize: 16, color: '#1ea84a', fontWeight: 900 }}>
                        0
                      </div>
                    </div>

                    <div
                      style={{
                        border: '1px solid #e8e2d7',
                        borderRadius: 16,
                        padding: 10,
                        background: '#fff',
                      }}
                    >
                      <div style={{ fontSize: 12, color: '#7a8290', fontWeight: 800 }}>
                        {labels.radiusShort}
                      </div>
                      <div style={{ marginTop: 6, fontSize: 16, color: '#ff4a43', fontWeight: 900 }}>
                        {radiusKm} km
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 10,
                      marginTop: 12,
                    }}
                  >
                    <div
                      style={{
                        height: 42,
                        padding: '0 18px',
                        borderRadius: 999,
                        background: '#1ea84a',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 900,
                        fontSize: 14,
                      }}
                    >
                      ✓ {labels.active}
                    </div>

                    <div
                      style={{
                        minWidth: 92,
                        height: 42,
                        padding: '0 16px',
                        borderRadius: 999,
                        background: '#eff9f0',
                        color: '#1ea84a',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 900,
                        fontSize: 14,
                      }}
                    >
                      {language === 'RU'
                        ? `${durationDays} дн.`
                        : durationDays === 1
                          ? '1 day'
                          : `${durationDays} days`}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={goToPayment}
              style={{
                height: 58,
                border: 'none',
                borderRadius: 18,
                background: '#1faf46',
                color: '#fff',
                fontSize: 18,
                fontWeight: 900,
                cursor: 'pointer',
                boxShadow: '0 10px 22px rgba(31,175,70,0.22)',
              }}
            >
              {labels.goToPayment} &nbsp; {formatMoney(price)}
            </button>
          </div>
        </div>
      </div>

      {activePhoto ? (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 50,
            background: 'rgba(14,18,30,0.64)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 12,
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 460,
              maxHeight: '92vh',
              overflow: 'auto',
              background: '#fff',
              borderRadius: 28,
              padding: 16,
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '54px 1fr 54px',
                alignItems: 'center',
                gap: 12,
                marginBottom: 12,
              }}
            >
              <button
                onClick={() => setEditingPhotoId(null)}
                style={{
                  width: 54,
                  height: 54,
                  borderRadius: 999,
                  border: '1px solid #e5ded2',
                  background: '#fff',
                  fontSize: 28,
                  color: '#1b2033',
                  cursor: 'pointer',
                }}
              >
                ‹
              </button>

              <div
                style={{
                  textAlign: 'center',
                  fontWeight: 900,
                  fontSize: 20,
                  color: '#161a2e',
                }}
              >
                {labels.editPhoto}
              </div>

              <button
                onClick={() => setEditingPhotoId(null)}
                style={{
                  width: 54,
                  height: 54,
                  borderRadius: 999,
                  border: '1px solid #e5ded2',
                  background: '#fff',
                  fontSize: 28,
                  color: '#1b2033',
                  cursor: 'pointer',
                }}
              >
                ×
              </button>
            </div>

            <div
              style={{
                position: 'relative',
                height: 520,
                borderRadius: 22,
                overflow: 'hidden',
                background: '#2d2d2d',
                marginBottom: 12,
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  inset: 18,
                  border: '2px solid rgba(255,255,255,0.92)',
                  borderRadius: 6,
                  pointerEvents: 'none',
                }}
              />

              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  pointerEvents: 'none',
                  opacity: 0.15,
                }}
              >
                <div style={{ borderRight: '1px solid #fff' }} />
                <div style={{ borderRight: '1px solid #fff' }} />
                <div />
              </div>

              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'grid',
                  gridTemplateRows: '1fr 1fr 1fr',
                  pointerEvents: 'none',
                  opacity: 0.15,
                }}
              >
                <div style={{ borderBottom: '1px solid #fff' }} />
                <div style={{ borderBottom: '1px solid #fff' }} />
                <div />
              </div>

              <img
                src={activePhoto.src}
                alt="Editing"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                  transform: getPhotoTransform(activePhoto),
                  transition: 'transform 0.15s ease',
                }}
              />

              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  bottom: 90,
                  textAlign: 'center',
                  color: '#fff',
                  fontSize: 14,
                  fontWeight: 700,
                  textShadow: '0 2px 12px rgba(0,0,0,0.5)',
                  padding: '0 16px',
                }}
              >
                {labels.editorHint}
              </div>

              <div
                style={{
                  position: 'absolute',
                  left: 16,
                  right: 16,
                  bottom: 18,
                  display: 'grid',
                  gridTemplateColumns: '1.6fr 1fr 1fr',
                  gap: 12,
                }}
              >
                <div
                  style={{
                    height: 54,
                    borderRadius: 16,
                    background: '#fff',
                    display: 'grid',
                    gridTemplateColumns: '54px 1fr 54px',
                    alignItems: 'center',
                  }}
                >
                  <button
                    onClick={() =>
                      updatePhoto(activePhoto.id, {
                        zoom: Math.max(0.8, Number((activePhoto.zoom - 0.1).toFixed(2))),
                      })
                    }
                    style={{
                      height: '100%',
                      border: 'none',
                      background: 'transparent',
                      fontSize: 32,
                      cursor: 'pointer',
                      color: '#1b2033',
                    }}
                  >
                    −
                  </button>

                  <div
                    style={{
                      textAlign: 'center',
                      fontWeight: 900,
                      fontSize: 18,
                      color: '#1b2033',
                    }}
                  >
                    {Math.round(activePhoto.zoom * 100)}%
                  </div>

                  <button
                    onClick={() =>
                      updatePhoto(activePhoto.id, {
                        zoom: Math.min(2.5, Number((activePhoto.zoom + 0.1).toFixed(2))),
                      })
                    }
                    style={{
                      height: '100%',
                      border: 'none',
                      background: 'transparent',
                      fontSize: 32,
                      cursor: 'pointer',
                      color: '#1b2033',
                    }}
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={() =>
                    updatePhoto(activePhoto.id, {
                      rotate: activePhoto.rotate - 90,
                    })
                  }
                  style={{
                    height: 54,
                    borderRadius: 16,
                    border: 'none',
                    background: '#fff',
                    fontSize: 24,
                    cursor: 'pointer',
                  }}
                >
                  ↺
                </button>

                <button
                  onClick={() =>
                    updatePhoto(activePhoto.id, {
                      rotate: activePhoto.rotate + 90,
                    })
                  }
                  style={{
                    height: 54,
                    borderRadius: 16,
                    border: 'none',
                    background: '#fff',
                    fontSize: 24,
                    cursor: 'pointer',
                  }}
                >
                  ↻
                </button>
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                gap: 10,
                marginBottom: 12,
              }}
            >
              <button
                onClick={() =>
                  updatePhoto(activePhoto.id, {
                    zoom: Math.max(0.8, Number((activePhoto.zoom - 0.05).toFixed(2))),
                  })
                }
                style={{
                  height: 46,
                  borderRadius: 14,
                  border: '1px solid #dce8de',
                  background: '#eef8f0',
                  color: '#2f8b48',
                  fontWeight: 900,
                  cursor: 'pointer',
                }}
              >
                {labels.zoom}
              </button>

              <button
                onClick={() =>
                  updatePhoto(activePhoto.id, {
                    offsetX: activePhoto.offsetX + 10,
                  })
                }
                style={{
                  height: 46,
                  borderRadius: 14,
                  border: '1px solid #e5ded2',
                  background: '#fff',
                  color: '#1b2033',
                  fontWeight: 900,
                  cursor: 'pointer',
                }}
              >
                {labels.position}
              </button>

              <button
                onClick={() =>
                  updatePhoto(activePhoto.id, {
                    rotate: activePhoto.rotate + 90,
                  })
                }
                style={{
                  height: 46,
                  borderRadius: 14,
                  border: '1px solid #e5ded2',
                  background: '#fff',
                  color: '#1b2033',
                  fontWeight: 900,
                  cursor: 'pointer',
                }}
              >
                {labels.rotate}
              </button>
            </div>

            <div
              style={{
                display: 'flex',
                gap: 8,
                overflowX: 'auto',
                paddingBottom: 8,
                marginBottom: 14,
              }}
            >
              {photos.map((photo, index) => (
                <button
                  key={photo.id}
                  onClick={() => setEditingPhotoId(photo.id)}
                  style={{
                    position: 'relative',
                    flex: '0 0 auto',
                    width: 74,
                    height: 74,
                    borderRadius: 14,
                    overflow: 'hidden',
                    border:
                      photo.id === activePhoto.id ? '3px solid #27ae45' : '1px solid #ddd6cb',
                    background: '#f3f4f6',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  <img
                    src={photo.src}
                    alt={`Thumb ${index + 1}`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                      transform: getPhotoTransform(photo),
                    }}
                  />

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removePhoto(photo.id);
                    }}
                    style={{
                      position: 'absolute',
                      top: 4,
                      right: 4,
                      width: 22,
                      height: 22,
                      borderRadius: 999,
                      border: 'none',
                      background: '#fff',
                      color: '#1b2033',
                      fontSize: 16,
                      cursor: 'pointer',
                    }}
                  >
                    ×
                  </button>
                </button>
              ))}

              {photos.length < MAX_PHOTOS ? (
                <button
                  onClick={() => galleryInputRef.current?.click()}
                  style={{
                    flex: '0 0 auto',
                    width: 74,
                    height: 74,
                    borderRadius: 14,
                    border: '1px dashed #ddd6cb',
                    background: '#faf9f7',
                    fontSize: 34,
                    color: '#1b2033',
                    cursor: 'pointer',
                  }}
                >
                  +
                </button>
              ) : null}
            </div>

            <button
              onClick={() => setEditingPhotoId(null)}
              style={{
                width: '100%',
                height: 58,
                border: 'none',
                borderRadius: 18,
                background: '#1faf46',
                color: '#fff',
                fontSize: 18,
                fontWeight: 900,
                cursor: 'pointer',
              }}
            >
              {labels.done}
            </button>
          </div>
        </div>
      ) : null}
    </main>
  );
}
