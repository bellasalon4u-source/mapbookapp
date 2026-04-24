'use client';

import { type ReactNode, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  getPromotionById,
  incrementPromotionViews,
  type PromotionItem,
} from '../../../services/promotionsStore';
import { getAllMasters } from '../../../services/masters';
import { categories } from '../../../services/categories';
import {
  getSavedLanguage,
  subscribeToLanguageChange,
  type AppLanguage,
} from '../../../services/i18n';
import { formatDisplayPrice } from '../../../services/currencyDisplay';

type MasterLike = {
  id: string | number;
  name?: string;
  title?: string;
  category?: string;
  subcategory?: string;
  avatar?: string;
  rating?: number;
};

type PromotionDetailsTexts = {
  back: string;
  close: string;
  notFound: string;
  notFoundSub: string;
  specialOffer: string;
  views: string;
  category: string;
  save: string;
  professional: string;
  openProfile: string;
  share: string;
  bookNow: string;
  aboutOffer: string;
  included: string;
  pricing: string;
  oldPrice: string;
  now: string;
  youSave: string;
  validUntil: string;
  location: string;
  area: string;
  address: string;
  distance: string;
  copied: string;
  beauty: string;
  providerFallback: string;
  noAddress: string;
};

const EN_TEXTS: PromotionDetailsTexts = {
  back: 'Back',
  close: 'Close',
  notFound: 'Promotion not found',
  notFoundSub: 'This offer is unavailable or no longer exists.',
  specialOffer: 'Special offer',
  views: 'Views',
  category: 'Category',
  save: 'You save',
  professional: 'Professional',
  openProfile: 'Open profile',
  share: 'Share',
  bookNow: 'Book now',
  aboutOffer: 'About this ad',
  included: 'What’s included',
  pricing: 'Pricing',
  oldPrice: 'Old price',
  now: 'Now',
  youSave: 'You save',
  validUntil: 'Valid until',
  location: 'Location',
  area: 'Area',
  address: 'Address',
  distance: 'Distance',
  copied: 'Link copied',
  beauty: 'Beauty',
  providerFallback: 'Provider',
  noAddress: 'Contacts and address are shown inside this ad',
};

const TEXTS_BY_LANGUAGE: Record<AppLanguage, PromotionDetailsTexts> = {
  EN: EN_TEXTS,

  ES: {
    back: 'Atrás',
    close: 'Cerrar',
    notFound: 'Publicidad no encontrada',
    notFoundSub: 'Esta oferta no está disponible o ya no existe.',
    specialOffer: 'Oferta especial',
    views: 'Vistas',
    category: 'Categoría',
    save: 'Ahorro',
    professional: 'Profesional',
    openProfile: 'Abrir perfil',
    share: 'Compartir',
    bookNow: 'Reservar',
    aboutOffer: 'Sobre esta publicidad',
    included: 'Qué incluye',
    pricing: 'Precio',
    oldPrice: 'Precio anterior',
    now: 'Ahora',
    youSave: 'Ahorras',
    validUntil: 'Válido hasta',
    location: 'Ubicación',
    area: 'Zona',
    address: 'Dirección',
    distance: 'Distancia',
    copied: 'Enlace copiado',
    beauty: 'Belleza',
    providerFallback: 'Profesional',
    noAddress: 'Los contactos y la dirección están indicados en la publicidad',
  },

  RU: {
    back: 'Назад',
    close: 'Закрыть',
    notFound: 'Реклама не найдена',
    notFoundSub: 'Это предложение недоступно или больше не существует.',
    specialOffer: 'Специальное предложение',
    views: 'Просмотры',
    category: 'Категория',
    save: 'Экономия',
    professional: 'Специалист',
    openProfile: 'Открыть профиль',
    share: 'Поделиться',
    bookNow: 'Забронировать',
    aboutOffer: 'Об этой рекламе',
    included: 'Что входит',
    pricing: 'Стоимость',
    oldPrice: 'Старая цена',
    now: 'Сейчас',
    youSave: 'Вы экономите',
    validUntil: 'Действует до',
    location: 'Локация',
    area: 'Район',
    address: 'Адрес',
    distance: 'Расстояние',
    copied: 'Ссылка скопирована',
    beauty: 'Красота',
    providerFallback: 'Исполнитель',
    noAddress: 'Контакты и адрес указаны в рекламе',
  },

  UA: {
    back: 'Назад',
    close: 'Закрити',
    notFound: 'Рекламу не знайдено',
    notFoundSub: 'Ця пропозиція недоступна або більше не існує.',
    specialOffer: 'Спеціальна пропозиція',
    views: 'Перегляди',
    category: 'Категорія',
    save: 'Економія',
    professional: 'Спеціаліст',
    openProfile: 'Відкрити профіль',
    share: 'Поділитися',
    bookNow: 'Забронювати',
    aboutOffer: 'Про цю рекламу',
    included: 'Що входить',
    pricing: 'Вартість',
    oldPrice: 'Стара ціна',
    now: 'Зараз',
    youSave: 'Ви економите',
    validUntil: 'Діє до',
    location: 'Локація',
    area: 'Район',
    address: 'Адреса',
    distance: 'Відстань',
    copied: 'Посилання скопійовано',
    beauty: 'Краса',
    providerFallback: 'Виконавець',
    noAddress: 'Контакти та адреса вказані в рекламі',
  },

  CZ: {
    back: 'Zpět',
    close: 'Zavřít',
    notFound: 'Reklama nenalezena',
    notFoundSub: 'Tato nabídka není dostupná nebo již neexistuje.',
    specialOffer: 'Speciální nabídka',
    views: 'Zobrazení',
    category: 'Kategorie',
    save: 'Úspora',
    professional: 'Specialista',
    openProfile: 'Otevřít profil',
    share: 'Sdílet',
    bookNow: 'Rezervovat',
    aboutOffer: 'O této reklamě',
    included: 'Co je zahrnuto',
    pricing: 'Cena',
    oldPrice: 'Původní cena',
    now: 'Nyní',
    youSave: 'Ušetříte',
    validUntil: 'Platí do',
    location: 'Lokalita',
    area: 'Oblast',
    address: 'Adresa',
    distance: 'Vzdálenost',
    copied: 'Odkaz zkopírován',
    beauty: 'Krása',
    providerFallback: 'Poskytovatel',
    noAddress: 'Kontakty a adresa jsou uvedeny v reklamě',
  },

  DE: {
    back: 'Zurück',
    close: 'Schließen',
    notFound: 'Werbung nicht gefunden',
    notFoundSub: 'Dieses Angebot ist nicht verfügbar oder existiert nicht mehr.',
    specialOffer: 'Sonderangebot',
    views: 'Aufrufe',
    category: 'Kategorie',
    save: 'Ersparnis',
    professional: 'Profi',
    openProfile: 'Profil öffnen',
    share: 'Teilen',
    bookNow: 'Jetzt buchen',
    aboutOffer: 'Über diese Werbung',
    included: 'Enthalten',
    pricing: 'Preis',
    oldPrice: 'Alter Preis',
    now: 'Jetzt',
    youSave: 'Sie sparen',
    validUntil: 'Gültig bis',
    location: 'Standort',
    area: 'Bereich',
    address: 'Adresse',
    distance: 'Entfernung',
    copied: 'Link kopiert',
    beauty: 'Beauty',
    providerFallback: 'Anbieter',
    noAddress: 'Kontakte und Adresse stehen in der Werbung',
  },

  IT: {
    back: 'Indietro',
    close: 'Chiudi',
    notFound: 'Pubblicità non trovata',
    notFoundSub: 'Questa offerta non è disponibile o non esiste più.',
    specialOffer: 'Offerta speciale',
    views: 'Visualizzazioni',
    category: 'Categoria',
    save: 'Risparmio',
    professional: 'Professionista',
    openProfile: 'Apri profilo',
    share: 'Condividi',
    bookNow: 'Prenota',
    aboutOffer: 'Informazioni su questa pubblicità',
    included: 'Cosa include',
    pricing: 'Prezzo',
    oldPrice: 'Vecchio prezzo',
    now: 'Ora',
    youSave: 'Risparmi',
    validUntil: 'Valido fino a',
    location: 'Posizione',
    area: 'Zona',
    address: 'Indirizzo',
    distance: 'Distanza',
    copied: 'Link copiato',
    beauty: 'Beauty',
    providerFallback: 'Fornitore',
    noAddress: 'Contatti e indirizzo sono indicati nella pubblicità',
  },

  FR: {
    back: 'Retour',
    close: 'Fermer',
    notFound: 'Publicité introuvable',
    notFoundSub: 'Cette offre est indisponible ou n’existe plus.',
    specialOffer: 'Offre spéciale',
    views: 'Vues',
    category: 'Catégorie',
    save: 'Économie',
    professional: 'Professionnel',
    openProfile: 'Ouvrir le profil',
    share: 'Partager',
    bookNow: 'Réserver',
    aboutOffer: 'À propos de cette publicité',
    included: 'Ce qui est inclus',
    pricing: 'Prix',
    oldPrice: 'Ancien prix',
    now: 'Maintenant',
    youSave: 'Vous économisez',
    validUntil: 'Valable jusqu’au',
    location: 'Localisation',
    area: 'Zone',
    address: 'Adresse',
    distance: 'Distance',
    copied: 'Lien copié',
    beauty: 'Beauté',
    providerFallback: 'Prestataire',
    noAddress: 'Les contacts et l’adresse sont indiqués dans la publicité',
  },

  AR: {
    back: 'رجوع',
    close: 'إغلاق',
    notFound: 'الإعلان غير موجود',
    notFoundSub: 'هذا العرض غير متاح أو لم يعد موجوداً.',
    specialOffer: 'عرض خاص',
    views: 'المشاهدات',
    category: 'الفئة',
    save: 'توفير',
    professional: 'متخصص',
    openProfile: 'فتح الملف',
    share: 'مشاركة',
    bookNow: 'احجز الآن',
    aboutOffer: 'حول هذا الإعلان',
    included: 'ما الذي يشمله',
    pricing: 'السعر',
    oldPrice: 'السعر السابق',
    now: 'الآن',
    youSave: 'توفر',
    validUntil: 'صالح حتى',
    location: 'الموقع',
    area: 'المنطقة',
    address: 'العنوان',
    distance: 'المسافة',
    copied: 'تم نسخ الرابط',
    beauty: 'الجمال',
    providerFallback: 'مقدم الخدمة',
    noAddress: 'جهات الاتصال والعنوان موجودة داخل الإعلان',
  },

  PL: {
    back: 'Wstecz',
    close: 'Zamknij',
    notFound: 'Reklama nie znaleziona',
    notFoundSub: 'Ta oferta jest niedostępna lub już nie istnieje.',
    specialOffer: 'Oferta specjalna',
    views: 'Wyświetlenia',
    category: 'Kategoria',
    save: 'Oszczędzasz',
    professional: 'Specjalista',
    openProfile: 'Otwórz profil',
    share: 'Udostępnij',
    bookNow: 'Zarezerwuj',
    aboutOffer: 'O tej reklamie',
    included: 'Co zawiera',
    pricing: 'Cena',
    oldPrice: 'Stara cena',
    now: 'Teraz',
    youSave: 'Oszczędzasz',
    validUntil: 'Ważne do',
    location: 'Lokalizacja',
    area: 'Obszar',
    address: 'Adres',
    distance: 'Odległość',
    copied: 'Link skopiowany',
    beauty: 'Uroda',
    providerFallback: 'Wykonawca',
    noAddress: 'Kontakt i adres są podane w reklamie',
  },
};

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div
      style={{
        background: '#ffffff',
        borderRadius: 30,
        padding: 18,
        border: '2px solid #111111',
      }}
    >
      <h2
        style={{
          fontSize: 22,
          fontWeight: 900,
          color: '#17130f',
          margin: 0,
          marginBottom: 14,
          lineHeight: 1.15,
        }}
      >
        {title}
      </h2>
      {children}
    </div>
  );
}

function getTexts(language: AppLanguage) {
  return TEXTS_BY_LANGUAGE[language] || TEXTS_BY_LANGUAGE.EN;
}

function parsePriceNumber(value: string | undefined) {
  if (!value) return null;
  const parsed = Number(String(value).replace(/[^\d.]/g, ''));
  return Number.isFinite(parsed) ? parsed : null;
}

function getLocalizedCategoryLabel(categoryId: string | undefined, language: AppLanguage, fallback: string) {
  const normalized = String(categoryId || '').toLowerCase();

  const map: Record<string, Partial<Record<AppLanguage, string>>> = {
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
      UA: 'Освіта',
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

  const categoryFromList = categories.find((item) => item.id === normalized);

  return (
    map[normalized]?.[language] ||
    map[normalized]?.EN ||
    categoryFromList?.shortLabel ||
    categoryFromList?.label ||
    fallback
  );
}

function getCategoryLabel(
  promotion: PromotionItem | null,
  language: AppLanguage,
  fallback: string
) {
  if (!promotion) return fallback;
  return getLocalizedCategoryLabel(promotion.categoryId, language, fallback);
}

function normalizeText(value: string) {
  return String(value || '').toLowerCase().trim();
}

function findLinkedMaster(promotion: PromotionItem | null): MasterLike | null {
  if (!promotion) return null;

  const masters = getAllMasters() as MasterLike[];

  const exact = masters.find((item) => String(item.id) === String(promotion.masterId));
  if (exact) return exact;

  const normalizedTitle = normalizeText(promotion.title);
  const normalizedSubtitle = normalizeText(promotion.subtitle || '');

  const scored = masters
    .map((master) => {
      const haystack = normalizeText(
        [
          master.name || '',
          master.title || '',
          master.category || '',
          master.subcategory || '',
        ].join(' ')
      );

      let score = 0;

      if (normalizedTitle && haystack.includes(normalizedTitle)) score += 100;
      if (normalizedSubtitle && haystack.includes(normalizedSubtitle)) score += 50;

      if (
        promotion.categoryId &&
        normalizeText(master.category || '') === normalizeText(promotion.categoryId)
      ) {
        score += 30;
      }

      normalizedTitle
        .split(' ')
        .filter((word) => word.length > 2)
        .forEach((word) => {
          if (haystack.includes(word)) score += 10;
        });

      return { master, score };
    })
    .sort((a, b) => b.score - a.score);

  return scored[0]?.score > 0 ? scored[0].master : null;
}

export default function PromotionDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const promotionId = String(params?.id || '');

  const [language, setLanguage] = useState<AppLanguage>(getSavedLanguage());
  const [promotion, setPromotion] = useState<PromotionItem | null>(null);

  const text = getTexts(language);
  const isRtl = language === 'AR';

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
    if (!promotionId) return;

    const item = getPromotionById(promotionId, language);
    setPromotion(item);

    if (item) {
      incrementPromotionViews(item.id, 1);
      const refreshed = getPromotionById(item.id, language);
      setPromotion(refreshed);
    }
  }, [promotionId, language]);

  const master = useMemo(() => findLinkedMaster(promotion), [promotion]);

  const categoryLabel = useMemo(() => {
    return getCategoryLabel(promotion, language, text.beauty);
  }, [promotion, language, text.beauty]);

  const oldPriceValue = useMemo(
    () => parsePriceNumber(promotion?.oldPrice),
    [promotion?.oldPrice]
  );

  const newPriceValue = useMemo(
    () => parsePriceNumber(promotion?.newPrice),
    [promotion?.newPrice]
  );

  const saveAmount = useMemo(() => {
    if (oldPriceValue === null || newPriceValue === null) return 0;
    return Math.max(0, oldPriceValue - newPriceValue);
  }, [oldPriceValue, newPriceValue]);

  const handleShare = async () => {
    try {
      if (!promotion) return;

      if (navigator.share) {
        await navigator.share({
          title: promotion.title,
          text: `${promotion.title} — ${promotion.subtitle || ''}`,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert(text.copied);
      }
    } catch (error) {
      console.error('Share failed', error);
    }
  };

  const handleOpenProfile = () => {
    if (master?.id) {
      router.push(`/master/${master.id}`);
      return;
    }

    if (promotion?.masterId) {
      router.push(`/booking/${promotion.masterId}`);
    }
  };

  const handleBookNow = () => {
    if (!promotion) return;
    router.push(`/booking/${promotion.masterId}`);
  };

  if (!promotion) {
    return (
      <main
        dir={isRtl ? 'rtl' : 'ltr'}
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
              gridTemplateColumns: '54px 1fr 54px',
              alignItems: 'center',
              gap: 12,
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
                color: '#17130f',
                fontSize: 26,
                fontWeight: 900,
                cursor: 'pointer',
              }}
            >
              ←
            </button>

            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 900,
                  color: '#17130f',
                  lineHeight: 1.1,
                }}
              >
                {text.notFound}
              </div>
            </div>

            <button
              type="button"
              onClick={() => router.push('/')}
              style={{
                width: 54,
                height: 54,
                borderRadius: 999,
                border: '2px solid #111111',
                background: '#fff',
                color: '#17130f',
                fontSize: 24,
                fontWeight: 900,
                cursor: 'pointer',
              }}
            >
              ×
            </button>
          </div>

          <div
            style={{
              marginTop: 18,
              background: '#fff',
              borderRadius: 30,
              padding: 24,
              border: '2px solid #111111',
            }}
          >
            <div
              style={{
                fontSize: 16,
                color: '#6b7280',
                lineHeight: 1.6,
                fontWeight: 700,
              }}
            >
              {text.notFoundSub}
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main
      dir={isRtl ? 'rtl' : 'ltr'}
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
            gridTemplateColumns: '54px 1fr 54px',
            alignItems: 'center',
            gap: 12,
            marginBottom: 18,
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
              color: '#17130f',
              fontSize: 26,
              fontWeight: 900,
              cursor: 'pointer',
            }}
          >
            ←
          </button>

          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                fontSize: 22,
                fontWeight: 900,
                color: '#17130f',
                lineHeight: 1.1,
              }}
            >
              {promotion.title}
            </div>

            <div
              style={{
                marginTop: 4,
                fontSize: 13,
                color: '#7b7268',
                fontWeight: 700,
                lineHeight: 1.35,
              }}
            >
              {promotion.subtitle || text.specialOffer}
            </div>
          </div>

          <button
            type="button"
            onClick={() => router.push('/')}
            style={{
              width: 54,
              height: 54,
              borderRadius: 999,
              border: '2px solid #111111',
              background: '#fff',
              color: '#17130f',
              fontSize: 24,
              fontWeight: 900,
              cursor: 'pointer',
            }}
          >
            ×
          </button>
        </div>

        <div
          style={{
            background: '#fff',
            borderRadius: 30,
            overflow: 'hidden',
            border: '2px solid #111111',
          }}
        >
          <div style={{ position: 'relative' }}>
            <img
              src={promotion.image}
              alt={promotion.title}
              style={{
                width: '100%',
                height: 260,
                objectFit: 'cover',
                display: 'block',
              }}
            />

            {saveAmount > 0 ? (
              <div
                style={{
                  position: 'absolute',
                  top: 14,
                  left: isRtl ? 'auto' : 14,
                  right: isRtl ? 14 : 'auto',
                  borderRadius: 999,
                  border: '2px solid #111111',
                  background: '#ecfdf3',
                  color: '#15803d',
                  padding: '10px 14px',
                  fontSize: 13,
                  fontWeight: 900,
                }}
              >
                {text.save} {formatDisplayPrice(saveAmount)}
              </div>
            ) : null}
          </div>

          <div style={{ padding: 16 }}>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 8,
                marginBottom: 14,
              }}
            >
              <div
                style={{
                  borderRadius: 999,
                  border: '2px solid #111111',
                  background: '#fff0f6',
                  color: '#ff4fa0',
                  padding: '9px 12px',
                  fontSize: 12,
                  fontWeight: 900,
                }}
              >
                {text.views}: {promotion.views}
              </div>

              <div
                style={{
                  borderRadius: 999,
                  border: '2px solid #111111',
                  background: '#eef4ff',
                  color: '#2563eb',
                  padding: '9px 12px',
                  fontSize: 12,
                  fontWeight: 900,
                }}
              >
                {text.category}: {categoryLabel}
              </div>
            </div>

            <div
              style={{
                background: '#fff',
                borderRadius: 24,
                border: '2px solid #111111',
                padding: 14,
                display: 'grid',
                gridTemplateColumns: '64px 1fr',
                gap: 12,
                alignItems: 'center',
                marginBottom: 14,
              }}
            >
              <img
                src={
                  String(master?.avatar || '').trim() ||
                  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80'
                }
                alt={String(master?.name || promotion.title)}
                style={{
                  width: 64,
                  height: 64,
                  objectFit: 'cover',
                  borderRadius: 18,
                  border: '2px solid #111111',
                  display: 'block',
                }}
              />

              <div>
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 900,
                    color: '#17130f',
                    lineHeight: 1.15,
                  }}
                >
                  {String(master?.name || text.professional)}
                </div>

                <div
                  style={{
                    marginTop: 6,
                    fontSize: 14,
                    color: '#6b7280',
                    fontWeight: 700,
                    lineHeight: 1.4,
                  }}
                >
                  {String(master?.subcategory || master?.title || categoryLabel || text.providerFallback)}
                </div>

                <div
                  style={{
                    marginTop: 6,
                    fontSize: 13,
                    color: '#8b7355',
                    fontWeight: 900,
                  }}
                >
                  ★ {typeof master?.rating === 'number' ? master.rating.toFixed(1) : '4.9'}
                </div>
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: 10,
              }}
            >
              <button
                type="button"
                onClick={handleOpenProfile}
                style={{
                  minHeight: 52,
                  borderRadius: 18,
                  border: '2px solid #111111',
                  background: '#45c63d',
                  color: '#ffffff',
                  fontSize: 14,
                  fontWeight: 900,
                  cursor: 'pointer',
                }}
              >
                {text.openProfile}
              </button>

              <button
                type="button"
                onClick={handleShare}
                style={{
                  minHeight: 52,
                  borderRadius: 18,
                  border: '2px solid #111111',
                  background: '#eef4ff',
                  color: '#2563eb',
                  fontSize: 14,
                  fontWeight: 900,
                  cursor: 'pointer',
                }}
              >
                {text.share}
              </button>

              <button
                type="button"
                onClick={handleBookNow}
                style={{
                  minHeight: 52,
                  borderRadius: 18,
                  border: '2px solid #111111',
                  background: '#45c63d',
                  color: '#ffffff',
                  fontSize: 14,
                  fontWeight: 900,
                  cursor: 'pointer',
                }}
              >
                {text.bookNow}
              </button>
            </div>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gap: 16,
            marginTop: 16,
          }}
        >
          {!!promotion.description && (
            <SectionCard title={text.aboutOffer}>
              <p
                style={{
                  margin: 0,
                  fontSize: 15,
                  lineHeight: 1.6,
                  color: '#4b5563',
                  fontWeight: 700,
                }}
              >
                {promotion.description}
              </p>
            </SectionCard>
          )}

          {!!promotion.included?.length && (
            <SectionCard title={text.included}>
              <div style={{ display: 'grid', gap: 12 }}>
                {promotion.included.map((item) => (
                  <div
                    key={item}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      fontSize: 15,
                      color: '#374151',
                      fontWeight: 700,
                    }}
                  >
                    <div
                      style={{
                        width: 26,
                        height: 26,
                        borderRadius: '50%',
                        background: '#ecfdf3',
                        color: '#15803d',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 900,
                        flexShrink: 0,
                        border: '2px solid #111111',
                      }}
                    >
                      ✓
                    </div>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}

          {(promotion.oldPrice || promotion.newPrice || promotion.validUntil) && (
            <SectionCard title={text.pricing}>
              <div style={{ display: 'grid', gap: 14 }}>
                {!!promotion.oldPrice && oldPriceValue !== null && (
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: 16,
                      fontSize: 15,
                    }}
                  >
                    <span style={{ color: '#6b7280', fontWeight: 700 }}>{text.oldPrice}</span>
                    <span
                      style={{
                        color: '#9ca3af',
                        fontWeight: 900,
                        textDecoration: 'line-through',
                      }}
                    >
                      {formatDisplayPrice(oldPriceValue)}
                    </span>
                  </div>
                )}

                {!!promotion.newPrice && newPriceValue !== null && (
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: 16,
                      fontSize: 17,
                    }}
                  >
                    <span style={{ color: '#20202a', fontWeight: 900 }}>{text.now}</span>
                    <span style={{ color: '#45c63d', fontWeight: 900 }}>
                      {formatDisplayPrice(newPriceValue)}
                    </span>
                  </div>
                )}

                {saveAmount > 0 && (
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: 16,
                      fontSize: 15,
                    }}
                  >
                    <span style={{ color: '#6b7280', fontWeight: 700 }}>{text.youSave}</span>
                    <span style={{ color: '#15803d', fontWeight: 900 }}>
                      {formatDisplayPrice(saveAmount)}
                    </span>
                  </div>
                )}

                {!!promotion.validUntil && (
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: 16,
                      fontSize: 15,
                    }}
                  >
                    <span style={{ color: '#6b7280', fontWeight: 700 }}>{text.validUntil}</span>
                    <span style={{ color: '#20202a', fontWeight: 900 }}>
                      {promotion.validUntil}
                    </span>
                  </div>
                )}
              </div>
            </SectionCard>
          )}

          {(promotion.area || promotion.address || promotion.distance) && (
            <SectionCard title={text.location}>
              <div style={{ display: 'grid', gap: 12 }}>
                {!!promotion.area && (
                  <div>
                    <div
                      style={{
                        fontSize: 12,
                        color: '#9ca3af',
                        fontWeight: 900,
                        marginBottom: 4,
                        textTransform: 'uppercase',
                        letterSpacing: 0.5,
                      }}
                    >
                      {text.area}
                    </div>
                    <div
                      style={{
                        fontSize: 15,
                        color: '#20202a',
                        fontWeight: 900,
                      }}
                    >
                      {promotion.area}
                    </div>
                  </div>
                )}

                {!!promotion.address && (
                  <div>
                    <div
                      style={{
                        fontSize: 12,
                        color: '#9ca3af',
                        fontWeight: 900,
                        marginBottom: 4,
                        textTransform: 'uppercase',
                        letterSpacing: 0.5,
                      }}
                    >
                      {text.address}
                    </div>
                    <div
                      style={{
                        fontSize: 15,
                        color: '#20202a',
                        fontWeight: 900,
                        lineHeight: 1.5,
                      }}
                    >
                      {promotion.address}
                    </div>
                  </div>
                )}

                {!!promotion.distance && (
                  <div>
                    <div
                      style={{
                        fontSize: 12,
                        color: '#9ca3af',
                        fontWeight: 900,
                        marginBottom: 4,
                        textTransform: 'uppercase',
                        letterSpacing: 0.5,
                      }}
                    >
                      {text.distance}
                    </div>
                    <div
                      style={{
                        fontSize: 15,
                        color: '#20202a',
                        fontWeight: 900,
                      }}
                    >
                      {promotion.distance}
                    </div>
                  </div>
                )}
              </div>
            </SectionCard>
          )}
        </div>
      </div>
    </main>
  );
}
