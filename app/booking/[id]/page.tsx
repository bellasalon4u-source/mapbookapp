'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { getMasterById, getAllMasters } from '../../../services/masters';
import { getListings } from '../../../services/listingsStore';
import {
  getSavedLanguage,
  subscribeToLanguageChange,
  type AppLanguage,
} from '../../../services/i18n';
import { formatDisplayPrice } from '../../../services/currencyDisplay';

type ListingLike = {
  id: string | number;
  title?: string;
  category?: string;
  subcategory?: string;
  location?: string;
  description?: string;
  price?: string;
  hours?: string;
  availableToday?: boolean;
  photos?: string[];
  paymentMethods?: string[];
  serviceModes?: string[];
};

type ServiceLike = {
  slug: string;
  title: string;
  duration: string;
  price: number;
  image: string;
  description?: string;
};

type MasterLike = {
  id: string | number;
  name: string;
  title: string;
  city: string;
  avatar: string;
  cover?: string;
  rating?: number;
  priceFrom?: number;
  availableNow?: boolean;
  reviews?: number;
  description?: string;
  services: ServiceLike[];
};

const BRAND = {
  navy: '#071b46',
  blue: '#1467f2',
  green: '#21b84b',
  red: '#ff4b4b',
  border: '#111111',
  soft: '#f8f9fc',
  muted: '#6f7582',
};

function listingToMasterShape(listing: ListingLike, index: number): MasterLike {
  const fallbackImages = [
    'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=1200&q=80',
  ];

  const gallery =
    listing.photos && listing.photos.length > 0
      ? listing.photos
      : [
          fallbackImages[index % fallbackImages.length],
          fallbackImages[(index + 1) % fallbackImages.length],
          fallbackImages[(index + 2) % fallbackImages.length],
        ];

  const numericPrice = Number(String(listing.price || '').replace(/[^\d.]/g, ''));
  const priceFrom = Number.isFinite(numericPrice) && numericPrice > 0 ? numericPrice : 45;

  return {
    id: listing.id,
    name: listing.title || 'Provider',
    title: listing.subcategory || 'Service provider',
    city: listing.location || 'London',
    avatar: gallery[0],
    cover: gallery[1] || gallery[0],
    rating: 4.8,
    priceFrom,
    availableNow: Boolean(listing.availableToday),
    reviews: 0,
    description: listing.description || '',
    services: [
      {
        slug: 'main-service',
        title: listing.subcategory || listing.title || 'Main service',
        duration: listing.hours || '1h',
        price: priceFrom,
        image: gallery[0],
      },
      {
        slug: 'premium-service',
        title: 'Premium option',
        duration: '2h',
        price: priceFrom + 20,
        image: gallery[1] || gallery[0],
      },
    ],
  };
}

function getTexts(language: AppLanguage) {
  if (language === 'RU') {
    return {
      notFound: 'Специалист не найден',
      chooseServices: 'Выберите услуги',
      subtitle: 'Выберите услугу, затем дату, время и депозит',
      services: 'Услуги',
      totalDuration: 'Длительность',
      totalPrice: 'Цена',
      continue: 'Продолжить',
      from: 'от',
      providerFallback: 'Специалист',
      serviceProviderFallback: 'Исполнитель услуг',
      serviceFallback: 'Основная услуга',
      premiumOption: 'Премиум вариант',
      zeroMinutes: '0м',
      verified: 'Проверенный специалист',
      availableNow: 'Доступен сейчас',
      selected: 'Выбрано',
      select: 'Выбрать',
      step: 'Шаг 1 из 5',
      hint: 'Можно выбрать одну или несколько услуг.',
      back: 'Назад',
      home: 'Главная',
      selectedServices: 'Выбранные услуги',
      selectedCount: 'Выбрано',
      message: 'Сообщения',
    };
  }

  if (language === 'UA') {
    return {
      notFound: 'Спеціаліста не знайдено',
      chooseServices: 'Оберіть послуги',
      subtitle: 'Оберіть послугу, потім дату, час і депозит',
      services: 'Послуги',
      totalDuration: 'Тривалість',
      totalPrice: 'Ціна',
      continue: 'Продовжити',
      from: 'від',
      providerFallback: 'Спеціаліст',
      serviceProviderFallback: 'Виконавець послуг',
      serviceFallback: 'Основна послуга',
      premiumOption: 'Преміум варіант',
      zeroMinutes: '0хв',
      verified: 'Перевірений спеціаліст',
      availableNow: 'Доступний зараз',
      selected: 'Обрано',
      select: 'Обрати',
      step: 'Крок 1 з 5',
      hint: 'Можна обрати одну або кілька послуг.',
      back: 'Назад',
      home: 'Головна',
      selectedServices: 'Обрані послуги',
      selectedCount: 'Обрано',
      message: 'Повідомлення',
    };
  }

  return {
    notFound: 'Provider not found',
    chooseServices: 'Choose services',
    subtitle: 'Choose a service, then date, time and deposit',
    services: 'Services',
    totalDuration: 'Duration',
    totalPrice: 'Price',
    continue: 'Continue',
    from: 'from',
    providerFallback: 'Provider',
    serviceProviderFallback: 'Service provider',
    serviceFallback: 'Main service',
    premiumOption: 'Premium option',
    zeroMinutes: '0m',
    verified: 'Verified specialist',
    availableNow: 'Available now',
    selected: 'Selected',
    select: 'Select',
    step: 'Step 1 of 5',
    hint: 'You can choose one or several services.',
    back: 'Back',
    home: 'Home',
    selectedServices: 'Selected services',
    selectedCount: 'Selected',
    message: 'Messages',
  };
}

function OlamepLogo() {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
      }}
    >
      <div
        style={{
          width: 34,
          height: 42,
          position: 'relative',
          borderRadius: '50% 50% 58% 58%',
          background:
            'conic-gradient(from 210deg, #1467f2 0deg, #20c96b 90deg, #ffd629 160deg, #ff3f68 230deg, #1467f2 360deg)',
          boxShadow: '0 8px 18px rgba(20,103,242,0.18)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: 8,
            top: 8,
            width: 17,
            height: 17,
            borderRadius: '50%',
            background: '#ffffff',
            border: '4px solid #071b46',
          }}
        />
      </div>

      <div
        style={{
          fontSize: 30,
          fontWeight: 900,
          color: BRAND.navy,
          letterSpacing: '-1px',
        }}
      >
        Olamep
      </div>
    </div>
  );
}

function MessageIcon() {
  return (
    <div
      style={{
        width: 44,
        height: 44,
        borderRadius: 999,
        border: `2px solid ${BRAND.green}`,
        background: '#ffffff',
        color: BRAND.green,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 26,
        fontWeight: 900,
      }}
    >
      💬
    </div>
  );
}

function parseDurationToMinutes(value: string) {
  const text = String(value || '').toLowerCase();

  const hourMatch = text.match(/(\d+)\s*(h|hour|hours|ч|г|std)/i);
  const minuteMatch = text.match(/(\d+)\s*(m|min|mins|minute|minutes|м|хв)/i);

  const hours = hourMatch ? Number(hourMatch[1]) : 0;
  const minutes = minuteMatch ? Number(minuteMatch[1]) : 0;

  if (hours === 0 && minutes === 0) {
    const onlyNumber = Number(text.replace(/[^\d.]/g, ''));
    if (Number.isFinite(onlyNumber) && onlyNumber > 0) return onlyNumber;
  }

  return hours * 60 + minutes;
}

function formatMinutes(minutes: number, language: AppLanguage, zeroText: string) {
  if (!minutes) return zeroText;

  const h = Math.floor(minutes / 60);
  const m = minutes % 60;

  if (language === 'RU') {
    if (h > 0 && m > 0) return `${h}ч ${m}м`;
    if (h > 0) return `${h}ч`;
    return `${m}м`;
  }

  if (language === 'UA') {
    if (h > 0 && m > 0) return `${h}г ${m}хв`;
    if (h > 0) return `${h}г`;
    return `${m}хв`;
  }

  if (language === 'DE') {
    if (h > 0 && m > 0) return `${h}Std ${m}Min`;
    if (h > 0) return `${h}Std`;
    return `${m}Min`;
  }

  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
}

export default function BookingServicePage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = String(params.id || '');

  const [language, setLanguage] = useState<AppLanguage>(getSavedLanguage());
  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  const text = useMemo(() => getTexts(language), [language]);
  const preselectedService = searchParams.get('service') || '';

  useEffect(() => {
    const syncLanguage = () => {
      setLanguage(getSavedLanguage());
    };

    syncLanguage();

    const unsubLanguage = subscribeToLanguageChange((nextLanguage) => {
      setLanguage(nextLanguage);
    });

    window.addEventListener('focus', syncLanguage);
    window.addEventListener('pageshow', syncLanguage);
    window.addEventListener('storage', syncLanguage);

    return () => {
      unsubLanguage();
      window.removeEventListener('focus', syncLanguage);
      window.removeEventListener('pageshow', syncLanguage);
      window.removeEventListener('storage', syncLanguage);
    };
  }, []);

  const master = useMemo<MasterLike | null>(() => {
    const builtInMaster = getMasterById(id) as unknown as MasterLike | null;
    if (builtInMaster) return builtInMaster;

    const listings = getListings() as ListingLike[];
    const listingIndex = listings.findIndex((item) => String(item.id) === id);

    if (listingIndex !== -1) {
      const listing = listings[listingIndex];
      const mapped = listingToMasterShape(listing, listingIndex);
      const numericPrice = Number(String(listing.price || '').replace(/[^\d.]/g, ''));
      const priceFrom = Number.isFinite(numericPrice) && numericPrice > 0 ? numericPrice : 45;

      return {
        ...mapped,
        name: listing.title || text.providerFallback,
        title: listing.subcategory || text.serviceProviderFallback,
        services: [
          {
            slug: 'main-service',
            title: listing.subcategory || listing.title || text.serviceFallback,
            duration: listing.hours || '1h',
            price: priceFrom,
            image: mapped.services?.[0]?.image || mapped.avatar,
          },
          {
            slug: 'premium-service',
            title: text.premiumOption,
            duration: '2h',
            price: priceFrom + 20,
            image: mapped.services?.[1]?.image || mapped.services?.[0]?.image || mapped.avatar,
          },
        ],
      };
    }

    const fallbackMaster = (getAllMasters() as any[]).find((item) => String(item.id) === id);

    if (fallbackMaster) return fallbackMaster as MasterLike;

    return null;
  }, [id, text]);

  useEffect(() => {
    if (!master) return;

    if (preselectedService) {
      const exists = master.services.some((service) => service.slug === preselectedService);

      if (exists) {
        setSelectedServices([preselectedService]);
        return;
      }
    }

    setSelectedServices((prev) => {
      const valid = prev.filter((slug) => master.services.some((service) => service.slug === slug));
      return valid;
    });
  }, [master, preselectedService]);

  if (!master) {
    return (
      <main
        style={{
          minHeight: '100vh',
          background: '#ffffff',
          padding: 24,
          fontFamily: 'Arial, sans-serif',
          color: BRAND.navy,
        }}
      >
        <button
          type="button"
          onClick={() => router.back()}
          style={{
            width: 52,
            height: 52,
            borderRadius: 999,
            border: `2px solid ${BRAND.border}`,
            background: '#ffffff',
            fontSize: 24,
            fontWeight: 900,
            cursor: 'pointer',
          }}
        >
          ←
        </button>

        <div style={{ marginTop: 28, fontSize: 28, fontWeight: 900 }}>{text.notFound}</div>
      </main>
    );
  }

  const toggleService = (slug: string) => {
    setSelectedServices((prev) =>
      prev.includes(slug) ? prev.filter((item) => item !== slug) : [...prev, slug]
    );
  };

  const selectedItems = master.services.filter((service) => selectedServices.includes(service.slug));

  const totalPrice = selectedItems.reduce((sum, item) => sum + Number(item.price || 0), 0);

  const totalMinutes = selectedItems.reduce(
    (sum, item) => sum + parseDurationToMinutes(item.duration),
    0
  );

  const primaryService = selectedItems[0] || master.services[0];
  const primaryImage = primaryService?.image || master.avatar;

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#ffffff',
        fontFamily: 'Arial, sans-serif',
        color: BRAND.navy,
        paddingBottom: 132,
      }}
    >
      <div style={{ maxWidth: 430, margin: '0 auto', padding: '18px 18px 112px' }}>
        <header
          style={{
            display: 'grid',
            gridTemplateColumns: '46px 1fr 46px',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <button
            type="button"
            onClick={() => router.back()}
            aria-label={text.back}
            style={{
              width: 46,
              height: 46,
              border: '0',
              background: 'transparent',
              fontSize: 38,
              lineHeight: 1,
              color: BRAND.navy,
              fontWeight: 400,
              cursor: 'pointer',
            }}
          >
            ←
          </button>

          <div style={{ textAlign: 'center' }}>
            <OlamepLogo />
          </div>

          <button
            type="button"
            onClick={() => router.push('/messages')}
            aria-label={text.message}
            style={{
              width: 46,
              height: 46,
              border: 0,
              background: 'transparent',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <MessageIcon />
          </button>
        </header>

        <section style={{ marginTop: 28 }}>
          <h1
            style={{
              margin: 0,
              fontSize: 42,
              lineHeight: 1.02,
              fontWeight: 900,
              letterSpacing: '-1.6px',
              color: BRAND.navy,
            }}
          >
            {text.chooseServices}
          </h1>

          <p
            style={{
              margin: '10px 0 0',
              fontSize: 18,
              lineHeight: 1.35,
              fontWeight: 500,
              color: '#515866',
            }}
          >
            {text.subtitle}
          </p>
        </section>

        <section
          style={{
            marginTop: 18,
            borderRadius: 18,
            border: `2px solid ${BRAND.border}`,
            background: '#ffffff',
            padding: 12,
            boxShadow: '0 8px 22px rgba(7,27,70,0.08)',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '112px 1fr',
              gap: 14,
              alignItems: 'center',
            }}
          >
            <img
              src={primaryImage}
              alt={master.name}
              style={{
                width: 112,
                height: 112,
                borderRadius: 14,
                objectFit: 'cover',
                display: 'block',
              }}
            />

            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: 22,
                  lineHeight: 1.08,
                  fontWeight: 900,
                  color: BRAND.navy,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {master.name}
              </div>

              <div
                style={{
                  marginTop: 6,
                  color: '#4f5663',
                  fontSize: 17,
                  lineHeight: 1.25,
                  fontWeight: 500,
                }}
              >
                {master.title}
              </div>

              <div
                style={{
                  marginTop: 18,
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 10,
                }}
              >
                <div
                  style={{
                    border: `1.5px solid #d8dde8`,
                    borderRadius: 14,
                    padding: '10px 12px',
                    background: '#ffffff',
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      color: '#6f7582',
                      fontWeight: 800,
                    }}
                  >
                    ★ {typeof master.rating === 'number' ? master.rating.toFixed(1) : '4.8'}
                  </div>
                  <div
                    style={{
                      marginTop: 3,
                      fontSize: 15,
                      color: BRAND.green,
                      fontWeight: 900,
                    }}
                  >
                    {text.verified}
                  </div>
                </div>

                <div
                  style={{
                    border: `1.5px solid #d8dde8`,
                    borderRadius: 14,
                    padding: '10px 12px',
                    background: '#ffffff',
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      color: '#6f7582',
                      fontWeight: 800,
                    }}
                  >
                    {text.from}
                  </div>
                  <div
                    style={{
                      marginTop: 3,
                      fontSize: 17,
                      color: BRAND.navy,
                      fontWeight: 900,
                    }}
                  >
                    {formatDisplayPrice(master.priceFrom || master.services[0]?.price || 0)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section style={{ marginTop: 26 }}>
          <h2
            style={{
              margin: 0,
              fontSize: 28,
              lineHeight: 1.1,
              fontWeight: 900,
              color: BRAND.navy,
            }}
          >
            {text.services}
          </h2>

          <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 14 }}>
            {master.services.map((service) => {
              const active = selectedServices.includes(service.slug);

              return (
                <button
                  key={service.slug}
                  type="button"
                  onClick={() => toggleService(service.slug)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    background: '#ffffff',
                    border: active ? `2px solid ${BRAND.blue}` : `2px solid ${BRAND.border}`,
                    borderRadius: 18,
                    padding: 12,
                    display: 'grid',
                    gridTemplateColumns: '92px 1fr auto',
                    gap: 14,
                    alignItems: 'center',
                    cursor: 'pointer',
                    boxShadow: active
                      ? '0 8px 20px rgba(20,103,242,0.16)'
                      : '0 6px 16px rgba(7,27,70,0.06)',
                  }}
                >
                  <img
                    src={service.image}
                    alt={service.title}
                    style={{
                      width: 92,
                      height: 92,
                      objectFit: 'cover',
                      borderRadius: 14,
                      display: 'block',
                    }}
                  />

                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 20,
                        lineHeight: 1.15,
                        fontWeight: 900,
                        color: BRAND.navy,
                      }}
                    >
                      {service.title}
                    </div>

                    <div
                      style={{
                        marginTop: 8,
                        color: '#4f5663',
                        fontSize: 16,
                        fontWeight: 700,
                      }}
                    >
                      {service.duration}
                    </div>

                    <div
                      style={{
                        marginTop: 8,
                        display: 'inline-flex',
                        minHeight: 28,
                        padding: '0 10px',
                        alignItems: 'center',
                        borderRadius: 999,
                        background: active ? '#eaf2ff' : '#f4f6fa',
                        color: active ? BRAND.blue : '#6f7582',
                        fontSize: 12,
                        fontWeight: 900,
                      }}
                    >
                      {active ? text.selected : text.select}
                    </div>
                  </div>

                  <div
                    style={{
                      textAlign: 'right',
                      minWidth: 70,
                    }}
                  >
                    <div
                      style={{
                        color: BRAND.navy,
                        fontSize: 24,
                        lineHeight: 1,
                        fontWeight: 900,
                      }}
                    >
                      {formatDisplayPrice(service.price)}
                    </div>

                    <div
                      style={{
                        marginTop: 14,
                        marginLeft: 'auto',
                        width: 32,
                        height: 32,
                        borderRadius: 999,
                        background: active ? BRAND.blue : '#ffffff',
                        color: active ? '#ffffff' : '#9aa1ad',
                        border: active ? `2px solid ${BRAND.blue}` : '2px solid #cfd4dd',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 18,
                        fontWeight: 900,
                      }}
                    >
                      {active ? '✓' : '+'}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      </div>

      <div
        style={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 100,
          background: '#ffffff',
          borderTop: '1px solid #e4e7ee',
          padding: '12px 18px calc(14px + env(safe-area-inset-bottom))',
          boxShadow: '0 -12px 28px rgba(0,0,0,0.08)',
        }}
      >
        <div style={{ maxWidth: 430, margin: '0 auto' }}>
          <div
            style={{
              minHeight: 74,
              borderRadius: 18,
              border: '1.5px solid #d9dee8',
              background: '#ffffff',
              display: 'grid',
              gridTemplateColumns: '1fr 1.5px 1fr',
              alignItems: 'center',
              overflow: 'hidden',
              marginBottom: 12,
            }}
          >
            <div style={{ padding: '12px 16px' }}>
              <div
                style={{
                  fontSize: 13,
                  color: '#6f7582',
                  fontWeight: 800,
                }}
              >
                {text.totalDuration}
              </div>
              <div
                style={{
                  marginTop: 2,
                  fontSize: 22,
                  color: BRAND.navy,
                  fontWeight: 900,
                }}
              >
                {formatMinutes(totalMinutes, language, text.zeroMinutes)}
              </div>
            </div>

            <div style={{ height: 44, background: '#d9dee8' }} />

            <div style={{ padding: '12px 16px' }}>
              <div
                style={{
                  fontSize: 13,
                  color: '#6f7582',
                  fontWeight: 800,
                }}
              >
                {text.totalPrice}
              </div>
              <div
                style={{
                  marginTop: 2,
                  fontSize: 22,
                  color: selectedItems.length ? BRAND.navy : '#9ca3af',
                  fontWeight: 900,
                }}
              >
                {formatDisplayPrice(totalPrice)}
              </div>
            </div>
          </div>

          <button
            type="button"
            disabled={!selectedItems.length}
            onClick={() => {
              if (!selectedItems.length) return;

              const servicesParam = encodeURIComponent(selectedServices.join(','));
              router.push(`/booking/${master.id}/date?services=${servicesParam}`);
            }}
            style={{
              width: '100%',
              border: selectedItems.length ? `2px solid ${BRAND.border}` : '2px solid #b8c0cc',
              background: selectedItems.length ? BRAND.green : '#b7d9bf',
              color: '#ffffff',
              borderRadius: 18,
              padding: '18px 26px',
              fontWeight: 900,
              fontSize: 22,
              cursor: selectedItems.length ? 'pointer' : 'not-allowed',
              boxShadow: selectedItems.length ? '0 6px 0 rgba(17,17,17,0.10)' : 'none',
            }}
          >
            {text.continue} →
          </button>
        </div>
      </div>
    </main>
  );
}
