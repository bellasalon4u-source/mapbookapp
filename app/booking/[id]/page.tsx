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

function listingToMasterShape(listing: ListingLike, index: number): MasterLike {
  const fallbackImages = [
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1200&q=80',
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
      services: 'Услуги',
      totalDuration: 'Общая длительность',
      totalPrice: 'Общая цена',
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
      hint: 'Можно выбрать одну или несколько услуг. Дата, время и оплата будут дальше.',
      back: 'Назад',
      home: 'Главная',
    };
  }

  if (language === 'UA') {
    return {
      notFound: 'Спеціаліста не знайдено',
      chooseServices: 'Оберіть послуги',
      services: 'Послуги',
      totalDuration: 'Загальна тривалість',
      totalPrice: 'Загальна ціна',
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
      hint: 'Можна обрати одну або кілька послуг. Дата, час і оплата будуть далі.',
      back: 'Назад',
      home: 'Головна',
    };
  }

  if (language === 'ES') {
    return {
      notFound: 'Profesional no encontrado',
      chooseServices: 'Elige servicios',
      services: 'Servicios',
      totalDuration: 'Duración total',
      totalPrice: 'Precio total',
      continue: 'Continuar',
      from: 'desde',
      providerFallback: 'Profesional',
      serviceProviderFallback: 'Proveedor de servicios',
      serviceFallback: 'Servicio principal',
      premiumOption: 'Opción premium',
      zeroMinutes: '0 min',
      verified: 'Profesional verificado',
      availableNow: 'Disponible ahora',
      selected: 'Seleccionado',
      select: 'Seleccionar',
      step: 'Paso 1 de 5',
      hint: 'Puedes elegir uno o varios servicios. Fecha, hora y pago van después.',
      back: 'Atrás',
      home: 'Inicio',
    };
  }

  if (language === 'CZ') {
    return {
      notFound: 'Specialista nebyl nalezen',
      chooseServices: 'Vyberte služby',
      services: 'Služby',
      totalDuration: 'Celková délka',
      totalPrice: 'Celková cena',
      continue: 'Pokračovat',
      from: 'od',
      providerFallback: 'Specialista',
      serviceProviderFallback: 'Poskytovatel služeb',
      serviceFallback: 'Hlavní služba',
      premiumOption: 'Prémiová možnost',
      zeroMinutes: '0 min',
      verified: 'Ověřený specialista',
      availableNow: 'Dostupný nyní',
      selected: 'Vybráno',
      select: 'Vybrat',
      step: 'Krok 1 z 5',
      hint: 'Můžete vybrat jednu nebo více služeb. Datum, čas a platba budou dále.',
      back: 'Zpět',
      home: 'Domů',
    };
  }

  if (language === 'DE') {
    return {
      notFound: 'Spezialist nicht gefunden',
      chooseServices: 'Dienstleistungen wählen',
      services: 'Dienstleistungen',
      totalDuration: 'Gesamtdauer',
      totalPrice: 'Gesamtpreis',
      continue: 'Weiter',
      from: 'ab',
      providerFallback: 'Spezialist',
      serviceProviderFallback: 'Dienstleister',
      serviceFallback: 'Hauptservice',
      premiumOption: 'Premium-Option',
      zeroMinutes: '0 Min',
      verified: 'Verifizierter Spezialist',
      availableNow: 'Jetzt verfügbar',
      selected: 'Ausgewählt',
      select: 'Auswählen',
      step: 'Schritt 1 von 5',
      hint: 'Sie können eine oder mehrere Dienstleistungen auswählen. Datum, Zeit und Zahlung folgen.',
      back: 'Zurück',
      home: 'Home',
    };
  }

  if (language === 'PL') {
    return {
      notFound: 'Specjalista nie został znaleziony',
      chooseServices: 'Wybierz usługi',
      services: 'Usługi',
      totalDuration: 'Łączny czas',
      totalPrice: 'Łączna cena',
      continue: 'Dalej',
      from: 'od',
      providerFallback: 'Specjalista',
      serviceProviderFallback: 'Usługodawca',
      serviceFallback: 'Usługa główna',
      premiumOption: 'Opcja premium',
      zeroMinutes: '0 min',
      verified: 'Zweryfikowany specjalista',
      availableNow: 'Dostępny teraz',
      selected: 'Wybrano',
      select: 'Wybierz',
      step: 'Krok 1 z 5',
      hint: 'Możesz wybrać jedną lub kilka usług. Data, czas i płatność będą dalej.',
      back: 'Wstecz',
      home: 'Start',
    };
  }

  return {
    notFound: 'Provider not found',
    chooseServices: 'Choose services',
    services: 'Services',
    totalDuration: 'Total duration',
    totalPrice: 'Total price',
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
    hint: 'You can choose one or several services. Date, time and payment come next.',
    back: 'Back',
    home: 'Home',
  };
}

function OlamepLogo() {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 9,
      }}
    >
      <div
        style={{
          width: 34,
          height: 42,
          position: 'relative',
          borderRadius: '50% 50% 58% 58%',
          background:
            'conic-gradient(from 210deg, #0e73d8 0deg, #2fc96d 92deg, #ffd629 160deg, #ff4b72 230deg, #0e73d8 360deg)',
          boxShadow: '0 8px 18px rgba(14,115,216,0.20)',
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
          }}
        />
      </div>

      <div
        style={{
          fontSize: 28,
          fontWeight: 900,
          color: '#08245c',
          letterSpacing: '-1px',
        }}
      >
        Olamep
      </div>
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
          background: '#fcf8f2',
          padding: 24,
          fontFamily: 'Arial, sans-serif',
          color: '#17130f',
        }}
      >
        <button
          type="button"
          onClick={() => router.back()}
          style={{
            width: 52,
            height: 52,
            borderRadius: 999,
            border: '2px solid #111111',
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

  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #fffefa 0%, #fcf8f2 48%, #fff1f4 100%)',
        fontFamily: 'Arial, sans-serif',
        color: '#17130f',
        paddingBottom: 158,
      }}
    >
      <div style={{ maxWidth: 430, margin: '0 auto', padding: '18px 14px 120px' }}>
        <header
          style={{
            display: 'grid',
            gridTemplateColumns: '48px 1fr 48px',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <button
            type="button"
            onClick={() => router.back()}
            aria-label={text.back}
            style={{
              width: 48,
              height: 48,
              borderRadius: 999,
              border: '2px solid #111111',
              background: '#ffffff',
              fontSize: 25,
              color: '#17130f',
              fontWeight: 900,
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
            onClick={() => router.push('/')}
            aria-label={text.home}
            style={{
              width: 48,
              height: 48,
              borderRadius: 999,
              border: '2px solid #111111',
              background: '#ffffff',
              fontSize: 23,
              color: '#17130f',
              fontWeight: 900,
              cursor: 'pointer',
            }}
          >
            ×
          </button>
        </header>

        <section style={{ marginTop: 20 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              height: 34,
              padding: '0 14px',
              borderRadius: 999,
              border: '2px solid #111111',
              background: '#fff7cf',
              color: '#17130f',
              fontSize: 13,
              fontWeight: 900,
            }}
          >
            <span>●</span>
            <span>{text.step}</span>
          </div>

          <h1
            style={{
              margin: '14px 0 0',
              fontSize: 34,
              lineHeight: 1.05,
              fontWeight: 900,
              letterSpacing: '-1px',
              color: '#08245c',
            }}
          >
            {text.chooseServices}
          </h1>

          <p
            style={{
              margin: '8px 0 0',
              fontSize: 14,
              lineHeight: 1.45,
              fontWeight: 800,
              color: '#7b7268',
            }}
          >
            {text.hint}
          </p>
        </section>

        <section
          style={{
            marginTop: 18,
            borderRadius: 30,
            border: '2px solid #111111',
            background: '#ffffff',
            padding: 14,
            boxShadow: '0 8px 0 rgba(17,17,17,0.04)',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '92px 1fr',
              gap: 14,
              alignItems: 'center',
            }}
          >
            <img
              src={master.avatar}
              alt={master.name}
              style={{
                width: 92,
                height: 92,
                borderRadius: 24,
                objectFit: 'cover',
                border: '2px solid #111111',
              }}
            />

            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  minHeight: 28,
                  borderRadius: 999,
                  background: '#edf9ef',
                  color: '#1f8c3f',
                  border: '1.5px solid #55c75f',
                  padding: '0 10px',
                  fontSize: 11,
                  fontWeight: 900,
                }}
              >
                ✓ {text.verified}
              </div>

              <div
                style={{
                  marginTop: 8,
                  fontSize: 24,
                  lineHeight: 1.05,
                  fontWeight: 900,
                  color: '#17130f',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {master.name}
              </div>

              <div
                style={{
                  marginTop: 7,
                  color: '#746b62',
                  fontSize: 14,
                  lineHeight: 1.35,
                  fontWeight: 800,
                }}
              >
                {master.title} • {master.city}
              </div>

              <div
                style={{
                  marginTop: 8,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  flexWrap: 'wrap',
                  fontSize: 13,
                  fontWeight: 900,
                  color: '#17130f',
                }}
              >
                <span>★ {typeof master.rating === 'number' ? master.rating.toFixed(1) : '4.8'}</span>
                <span>•</span>
                <span>
                  {text.from} {formatDisplayPrice(master.priceFrom || master.services[0]?.price || 0)}
                </span>
              </div>
            </div>
          </div>
        </section>

        <section style={{ marginTop: 22 }}>
          <h2
            style={{
              margin: 0,
              fontSize: 26,
              lineHeight: 1.1,
              fontWeight: 900,
              color: '#17130f',
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
                    background: active ? '#f2fff6' : '#ffffff',
                    border: active ? '2px solid #35bf55' : '2px solid #111111',
                    borderRadius: 28,
                    padding: 12,
                    display: 'grid',
                    gridTemplateColumns: '96px 1fr',
                    gap: 14,
                    alignItems: 'center',
                    cursor: 'pointer',
                    boxShadow: active
                      ? '0 8px 0 rgba(53,191,85,0.14)'
                      : '0 7px 0 rgba(17,17,17,0.04)',
                  }}
                >
                  <div style={{ position: 'relative' }}>
                    <img
                      src={service.image}
                      alt={service.title}
                      style={{
                        width: 96,
                        height: 96,
                        objectFit: 'cover',
                        borderRadius: 22,
                        border: '2px solid #111111',
                        display: 'block',
                      }}
                    />

                    <div
                      style={{
                        position: 'absolute',
                        right: -7,
                        bottom: -7,
                        width: 36,
                        height: 36,
                        borderRadius: 999,
                        border: '2px solid #111111',
                        background: active ? '#35bf55' : '#ffffff',
                        color: active ? '#ffffff' : '#17130f',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: active ? 22 : 18,
                        fontWeight: 900,
                      }}
                    >
                      {active ? '✓' : '+'}
                    </div>
                  </div>

                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        minHeight: 28,
                        borderRadius: 999,
                        border: active ? '1.5px solid #35bf55' : '1.5px solid #d8cdc0',
                        background: active ? '#ffffff' : '#fffefa',
                        color: active ? '#1f8c3f' : '#7b7268',
                        padding: '0 10px',
                        fontSize: 11,
                        fontWeight: 900,
                      }}
                    >
                      {active ? text.selected : text.select}
                    </div>

                    <div
                      style={{
                        marginTop: 8,
                        fontSize: 19,
                        lineHeight: 1.15,
                        fontWeight: 900,
                        color: '#17130f',
                      }}
                    >
                      {service.title}
                    </div>

                    <div
                      style={{
                        marginTop: 7,
                        color: '#746b62',
                        fontSize: 14,
                        fontWeight: 800,
                      }}
                    >
                      {service.duration}
                    </div>

                    <div
                      style={{
                        marginTop: 9,
                        color: '#ff3b3b',
                        fontSize: 24,
                        lineHeight: 1,
                        fontWeight: 900,
                      }}
                    >
                      {formatDisplayPrice(service.price)}
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
          borderTop: '2px solid #111111',
          padding: '12px 14px calc(14px + env(safe-area-inset-bottom))',
          boxShadow: '0 -12px 28px rgba(0,0,0,0.08)',
        }}
      >
        <div style={{ maxWidth: 430, margin: '0 auto' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 10,
              marginBottom: 12,
            }}
          >
            <div
              style={{
                borderRadius: 20,
                border: '2px solid #111111',
                background: '#fffefa',
                padding: '10px 12px',
              }}
            >
              <div style={{ fontSize: 12, color: '#6c645c', fontWeight: 900 }}>
                {text.totalDuration}
              </div>
              <div style={{ fontSize: 25, fontWeight: 900, marginTop: 5 }}>
                {formatMinutes(totalMinutes, language, text.zeroMinutes)}
              </div>
            </div>

            <div
              style={{
                borderRadius: 20,
                border: '2px solid #111111',
                background: '#fff2f2',
                padding: '10px 12px',
              }}
            >
              <div style={{ fontSize: 12, color: '#6c645c', fontWeight: 900 }}>
                {text.totalPrice}
              </div>
              <div
                style={{
                  fontSize: 25,
                  fontWeight: 900,
                  marginTop: 5,
                  color: selectedItems.length ? '#ff3b3b' : '#9ca3af',
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
              border: '2px solid #111111',
              background: selectedItems.length ? '#35bf55' : '#b7d9bf',
              color: '#ffffff',
              borderRadius: 22,
              padding: '17px 26px',
              fontWeight: 900,
              fontSize: 19,
              cursor: selectedItems.length ? 'pointer' : 'not-allowed',
              boxShadow: selectedItems.length ? '0 6px 0 rgba(17,17,17,0.12)' : 'none',
            }}
          >
            {text.continue}
          </button>
        </div>
      </div>
    </main>
  );
}
