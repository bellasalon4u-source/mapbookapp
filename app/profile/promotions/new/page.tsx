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

type RadiusOption = {
  id: '10' | '50' | '100';
  label: string;
  km: number;
  pricePerDay: number;
  color: string;
  bg: string;
};

type PromotionTexts = {
  pageTitle: string;
  pageSubtitle: string;
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
  summary: string;
  total: string;
  publish: string;
  done: string;
  enterTitle: string;
  enterDescription: string;
  addPhotoAlert: string;
};

const textByLanguage: Record<AppLanguage, PromotionTexts> = {
  EN: {
    pageTitle: 'Add advertisement',
    pageSubtitle: 'Create a bright ad to get more views and clients.',
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
    photo: 'Photo',
    photoHint: 'Add a photo for the ad',
    addPhoto: 'Add photo',
    photoAdded: 'Photo added',
    summary: 'Ad summary',
    total: 'Total',
    publish: 'Publish advertisement',
    done: 'Done',
    enterTitle: 'Enter ad title',
    enterDescription: 'Enter ad description',
    addPhotoAlert: 'Add a photo for the ad',
  },
  RU: {
    pageTitle: 'Добавить рекламу',
    pageSubtitle: 'Создайте яркую рекламу, чтобы получить больше просмотров и клиентов.',
    title: 'Название рекламы',
    titlePlaceholder: 'Введите название рекламы',
    description: 'Описание',
    descriptionPlaceholder: 'Введите описание рекламы...',
    badgeText: 'Бейдж скидки / текста',
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
    photoHint: 'Добавьте фото для рекламы',
    addPhoto: 'Добавить фото',
    photoAdded: 'Фото добавлено',
    summary: 'Итог рекламы',
    total: 'Итого',
    publish: 'Опубликовать рекламу',
    done: 'Готово',
    enterTitle: 'Введите название рекламы',
    enterDescription: 'Введите описание рекламы',
    addPhotoAlert: 'Добавьте фото для рекламы',
  },
  ES: {
    pageTitle: 'Añadir publicidad',
    pageSubtitle: 'Crea un anuncio atractivo para conseguir más vistas y clientes.',
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
    photo: 'Foto',
    photoHint: 'Añade una foto para el anuncio',
    addPhoto: 'Añadir foto',
    photoAdded: 'Foto añadida',
    summary: 'Resumen del anuncio',
    total: 'Total',
    publish: 'Publicar anuncio',
    done: 'Hecho',
    enterTitle: 'Introduce el título del anuncio',
    enterDescription: 'Introduce la descripción del anuncio',
    addPhotoAlert: 'Añade una foto para el anuncio',
  },
  CZ: {
    pageTitle: 'Přidat reklamu',
    pageSubtitle: 'Vytvořte výraznou reklamu pro více zobrazení a klientů.',
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
    photo: 'Foto',
    photoHint: 'Přidejte fotku pro reklamu',
    addPhoto: 'Přidat foto',
    photoAdded: 'Foto přidáno',
    summary: 'Shrnutí reklamy',
    total: 'Celkem',
    publish: 'Publikovat reklamu',
    done: 'Hotovo',
    enterTitle: 'Zadejte název reklamy',
    enterDescription: 'Zadejte popis reklamy',
    addPhotoAlert: 'Přidejte fotku pro reklamu',
  },
  DE: {
    pageTitle: 'Werbung hinzufügen',
    pageSubtitle: 'Erstellen Sie eine auffällige Werbung für mehr Aufrufe und Kunden.',
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
    photo: 'Foto',
    photoHint: 'Fügen Sie ein Foto für die Werbung hinzu',
    addPhoto: 'Foto hinzufügen',
    photoAdded: 'Foto hinzugefügt',
    summary: 'Werbeübersicht',
    total: 'Gesamt',
    publish: 'Werbung veröffentlichen',
    done: 'Fertig',
    enterTitle: 'Werbetitel eingeben',
    enterDescription: 'Werbebeschreibung eingeben',
    addPhotoAlert: 'Foto für die Werbung hinzufügen',
  },
  PL: {
    pageTitle: 'Dodaj reklamę',
    pageSubtitle: 'Stwórz atrakcyjną reklamę, aby zdobyć więcej wyświetleń i klientów.',
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
    photo: 'Zdjęcie',
    photoHint: 'Dodaj zdjęcie do reklamy',
    addPhoto: 'Dodaj zdjęcie',
    photoAdded: 'Zdjęcie dodane',
    summary: 'Podsumowanie reklamy',
    total: 'Razem',
    publish: 'Opublikuj reklamę',
    done: 'Gotowe',
    enterTitle: 'Wpisz tytuł reklamy',
    enterDescription: 'Wpisz opis reklamy',
    addPhotoAlert: 'Dodaj zdjęcie do reklamy',
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

export default function NewPromotionPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [language, setLanguage] = useState<AppLanguage>(getSavedLanguage());
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [discountText, setDiscountText] = useState('');
  const [days, setDays] = useState(10);
  const [radius, setRadius] = useState<RadiusOption['id']>('10');
  const [photoName, setPhotoName] = useState('');
  const [photoPreview, setPhotoPreview] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    setLanguage(getSavedLanguage());

    const unsubLanguage = subscribeToLanguageChange((nextLanguage) => {
      setLanguage(nextLanguage);
    });

    return () => {
      unsubLanguage();
    };
  }, []);

  const text = textByLanguage[language] || textByLanguage.EN;
  const radiusOptions = radiusOptionsByLanguage[language] || radiusOptionsByLanguage.EN;

  const selectedRadius =
    radiusOptions.find((item) => item.id === radius) || radiusOptions[0];

  const totalPrice = useMemo(
    () => Number((selectedRadius.pricePerDay * days).toFixed(2)),
    [selectedRadius.pricePerDay, days]
  );

  const handleOpenFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoSelected = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
    }

    const preview = URL.createObjectURL(file);
    setPhotoName(file.name);
    setPhotoPreview(preview);
    event.target.value = '';
  };

  const handleRemovePhoto = () => {
    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
    }
    setPhotoPreview('');
    setPhotoName('');
  };

  const handlePublish = () => {
    if (!title.trim()) {
      alert(text.enterTitle);
      return;
    }

    if (!description.trim()) {
      alert(text.enterDescription);
      return;
    }

    if (!photoName.trim()) {
      alert(text.addPhotoAlert);
      return;
    }

    setIsSuccess(true);

    setTimeout(() => {
      router.push('/profile/promotions');
    }, 900);
  };

  return (
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

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoSelected}
            style={{ display: 'none' }}
          />

          {!photoPreview ? (
            <button
              type="button"
              onClick={handleOpenFilePicker}
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
              <div style={{ position: 'relative' }}>
                <img
                  src={photoPreview}
                  alt={photoName || 'promotion-photo'}
                  style={{
                    width: '100%',
                    height: 220,
                    objectFit: 'cover',
                    display: 'block',
                  }}
                />

                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  style={{
                    position: 'absolute',
                    top: 10,
                    right: 10,
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
                    {photoName}
                  </div>
                </div>
              </div>
            </div>
          )}
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
            <div>{text.radius}: {selectedRadius.label}</div>
            <div>{text.duration}: {days}</div>
            <div>£{selectedRadius.pricePerDay} / {text.perDay}</div>
            <div style={{ color: selectedRadius.color, fontSize: 18 }}>
              {text.total}: £{totalPrice}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handlePublish}
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
          {text.publish} · £{totalPrice}
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
  );
}
