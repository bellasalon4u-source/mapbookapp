'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { getMasterById, getAllMasters } from '../../../../services/masters';
import { getListings } from '../../../../services/listingsStore';
import {
  getSavedLanguage,
  subscribeToLanguageChange,
  type AppLanguage,
} from '../../../../services/i18n';
import { formatDisplayPrice } from '../../../../services/currencyDisplay';

type PaymentMethod = 'olacash' | 'card' | 'paypal' | 'wallet';

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
};

type ServiceLike = {
  slug: string;
  title: string;
  duration: string;
  price: number;
  image: string;
};

type MasterLike = {
  id: string | number;
  name: string;
  title: string;
  city?: string;
  avatar: string;
  services: ServiceLike[];
};

const BRAND = {
  navy: '#071b46',
  blue: '#1467f2',
  green: '#21b84b',
  red: '#ff4b4b',
  pink: '#ff4f9a',
  yellow: '#ffd629',
  border: '#111111',
  muted: '#626977',
};

function getTexts(language: AppLanguage) {
  if (language === 'RU') {
    return {
      bookingNotFound: 'Бронирование не найдено',
      selectedProceduresNotFound: 'Выбранные процедуры не найдены',
      bookingSent: 'Заявка отправлена',
      bookingSentText1: 'Депозит успешно оплачен.',
      bookingSentText2: 'Теперь мастер должен подтвердить бронирование.',
      waitingConfirmation: 'Ожидаем подтверждение мастера',
      waitingText:
        'Пока мастер не подтвердил бронь, телефон, адрес, соцсети и маршрут скрыты. Доступен только чат внутри Olamep.',
      selectedProcedure: 'Выбранная услуга',
      totalDuration: 'Длительность',
      totalPrice: 'Цена',
      address: 'Адрес',
      phone: 'Телефон',
      email: 'Email',
      social: 'Соцсети',
      writeToSeller: 'Написать мастеру',
      callSeller: 'Позвонить мастеру',
      goHome: 'На главную',
      myBookings: 'Мои бронирования',
      buildRoute: 'Проложить маршрут',
      bookingDetails: 'Детали бронирования',
      specialistContacts: 'Контакты специалиста',
      contactsLocked: 'Контакты закрыты до подтверждения',
      routeLocked: 'Маршрут откроется после подтверждения мастером',
      locked: 'Закрыто',
      secured: 'Оплата подтверждена',
      depositPaid: 'Оплаченный депозит',
      paymentMethod: 'Способ оплаты',
      olacash: 'OlaCash',
      card: 'Банковская карта',
      paypal: 'PayPal',
      wallet: 'Apple Pay / Google Pay',
      date: 'Дата',
      time: 'Время',
      status: 'Статус',
      chatAvailable: 'Чат доступен',
      onlyChat: 'Только чат',
      providerFallback: 'Специалист',
      serviceProviderFallback: 'Исполнитель услуг',
      serviceFallback: 'Основная услуга',
      premiumOption: 'Премиум вариант',
    };
  }

  if (language === 'UA') {
    return {
      bookingNotFound: 'Бронювання не знайдено',
      selectedProceduresNotFound: 'Вибрані послуги не знайдено',
      bookingSent: 'Заявку відправлено',
      bookingSentText1: 'Депозит успішно оплачено.',
      bookingSentText2: 'Тепер майстер має підтвердити бронювання.',
      waitingConfirmation: 'Очікуємо підтвердження майстра',
      waitingText:
        'Поки майстер не підтвердив бронювання, телефон, адреса, соцмережі та маршрут приховані. Доступний тільки чат в Olamep.',
      selectedProcedure: 'Обрана послуга',
      totalDuration: 'Тривалість',
      totalPrice: 'Ціна',
      address: 'Адреса',
      phone: 'Телефон',
      email: 'Email',
      social: 'Соцмережі',
      writeToSeller: 'Написати майстру',
      callSeller: 'Подзвонити майстру',
      goHome: 'На головну',
      myBookings: 'Мої бронювання',
      buildRoute: 'Прокласти маршрут',
      bookingDetails: 'Деталі бронювання',
      specialistContacts: 'Контакти спеціаліста',
      contactsLocked: 'Контакти закриті до підтвердження',
      routeLocked: 'Маршрут відкриється після підтвердження майстром',
      locked: 'Закрито',
      secured: 'Оплату підтверджено',
      depositPaid: 'Оплачений депозит',
      paymentMethod: 'Метод оплати',
      olacash: 'OlaCash',
      card: 'Банківська карта',
      paypal: 'PayPal',
      wallet: 'Apple Pay / Google Pay',
      date: 'Дата',
      time: 'Час',
      status: 'Статус',
      chatAvailable: 'Чат доступний',
      onlyChat: 'Тільки чат',
      providerFallback: 'Спеціаліст',
      serviceProviderFallback: 'Виконавець послуг',
      serviceFallback: 'Основна послуга',
      premiumOption: 'Преміум варіант',
    };
  }

  return {
    bookingNotFound: 'Booking not found',
    selectedProceduresNotFound: 'Selected services not found',
    bookingSent: 'Booking request sent',
    bookingSentText1: 'Your deposit was paid successfully.',
    bookingSentText2: 'Now the provider needs to confirm your appointment.',
    waitingConfirmation: 'Waiting for provider confirmation',
    waitingText:
      'Until the provider confirms the booking, phone, address, social links and route are locked. Only Olamep in-app chat is available.',
    selectedProcedure: 'Selected service',
    totalDuration: 'Duration',
    totalPrice: 'Price',
    address: 'Address',
    phone: 'Phone',
    email: 'Email',
    social: 'Social',
    writeToSeller: 'Write to seller',
    callSeller: 'Call seller',
    goHome: 'Go home',
    myBookings: 'My bookings',
    buildRoute: 'Build route',
    bookingDetails: 'Booking details',
    specialistContacts: 'Specialist contacts',
    contactsLocked: 'Contacts locked until confirmation',
    routeLocked: 'Route unlocks after provider confirmation',
    locked: 'Locked',
    secured: 'Payment confirmed',
    depositPaid: 'Deposit paid',
    paymentMethod: 'Payment method',
    olacash: 'OlaCash',
    card: 'Bank card',
    paypal: 'PayPal',
    wallet: 'Apple Pay / Google Pay',
    date: 'Date',
    time: 'Time',
    status: 'Status',
    chatAvailable: 'Chat available',
    onlyChat: 'Chat only',
    providerFallback: 'Provider',
    serviceProviderFallback: 'Service provider',
    serviceFallback: 'Main service',
    premiumOption: 'Premium option',
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

function SmallIcon({ icon, color }: { icon: string; color: string }) {
  return (
    <div
      style={{
        width: 44,
        height: 44,
        borderRadius: 15,
        background: color,
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 21,
        fontWeight: 900,
        flex: '0 0 auto',
      }}
    >
      {icon}
    </div>
  );
}

function normalizePaymentMethod(value: string | null): PaymentMethod {
  if (value === 'olacash') return 'olacash';
  if (value === 'paypal') return 'paypal';
  if (value === 'wallet') return 'wallet';
  return 'card';
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

function formatMinutes(minutes: number, language: AppLanguage) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;

  if (!minutes) return '0m';

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

  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
}

function listingToMasterShape(listing: ListingLike, index: number, text: ReturnType<typeof getTexts>) {
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
    id: String(listing.id),
    name: listing.title || text.providerFallback,
    title: listing.subcategory || text.serviceProviderFallback,
    city: listing.location || 'London',
    avatar: gallery[0],
    services: [
      {
        slug: 'main-service',
        title: listing.subcategory || listing.title || text.serviceFallback,
        duration: listing.hours || '1h',
        price: priceFrom,
        image: gallery[0],
      },
      {
        slug: 'premium-service',
        title: text.premiumOption,
        duration: '2h',
        price: priceFrom + 20,
        image: gallery[1] || gallery[0],
      },
    ],
  };
}

export default function BookingConfirmedPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [language, setLanguage] = useState<AppLanguage>(getSavedLanguage());

  const text = useMemo(() => getTexts(language), [language]);
  const id = String(params.id);

  const servicesParam = searchParams.get('services') || '';
  const date = searchParams.get('date') || '';
  const time = searchParams.get('time') || '';
  const depositParam = searchParams.get('deposit') || '1';
  const paymentMethod = normalizePaymentMethod(searchParams.get('paymentMethod'));

  const depositAmount = Number(depositParam);
  const safeDepositAmount = Number.isFinite(depositAmount) && depositAmount > 0 ? depositAmount : 1;

  const paymentMethodLabel = text[paymentMethod];

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
      return listingToMasterShape(listings[listingIndex], listingIndex, text);
    }

    const fallbackMaster = (getAllMasters() as any[]).find((item: any) => String(item.id) === id);
    if (fallbackMaster) return fallbackMaster as MasterLike;

    return null;
  }, [id, text]);

  if (!master) {
    return (
      <main style={{ padding: 24, fontFamily: 'Arial, sans-serif', color: BRAND.navy }}>
        {text.bookingNotFound}
      </main>
    );
  }

  const selectedServiceSlugs = servicesParam
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  const selectedItems = master.services.filter((service) =>
    selectedServiceSlugs.includes(service.slug)
  );

  if (!selectedItems.length) {
    return (
      <main style={{ padding: 24, fontFamily: 'Arial, sans-serif', color: BRAND.navy }}>
        {text.selectedProceduresNotFound}
      </main>
    );
  }

  const totalPrice = selectedItems.reduce((sum, item) => sum + item.price, 0);
  const totalMinutes = selectedItems.reduce(
    (sum, item) => sum + parseDurationToMinutes(item.duration),
    0
  );

  const primaryService = selectedItems[0];

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#ffffff',
        fontFamily: 'Arial, sans-serif',
        color: BRAND.navy,
        paddingBottom: 34,
      }}
    >
      <div style={{ maxWidth: 430, margin: '0 auto', padding: '18px 18px 34px' }}>
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
            style={{
              width: 46,
              height: 46,
              border: 0,
              background: 'transparent',
              fontSize: 38,
              lineHeight: 1,
              color: BRAND.navy,
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

        <section
          style={{
            marginTop: 26,
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: 96,
              height: 96,
              borderRadius: 999,
              background: BRAND.green,
              color: '#ffffff',
              margin: '0 auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 56,
              fontWeight: 900,
              boxShadow: '0 14px 28px rgba(33,184,75,0.22)',
            }}
          >
            ✓
          </div>

          <h1
            style={{
              fontSize: 40,
              lineHeight: 1.03,
              marginTop: 20,
              marginBottom: 0,
              fontWeight: 900,
              letterSpacing: '-1.5px',
              color: BRAND.navy,
            }}
          >
            {text.bookingSent}
          </h1>

          <p
            style={{
              color: '#515866',
              fontSize: 17,
              marginTop: 12,
              lineHeight: 1.5,
              fontWeight: 600,
            }}
          >
            {text.bookingSentText1}
            <br />
            {text.bookingSentText2}
          </p>
        </section>

        <section
          style={{
            marginTop: 22,
            borderRadius: 18,
            border: `2px solid ${BRAND.border}`,
            background: '#ffffff',
            padding: 14,
            boxShadow: '0 8px 22px rgba(7,27,70,0.08)',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '96px 1fr auto',
              gap: 12,
              alignItems: 'center',
            }}
          >
            <img
              src={primaryService.image || master.avatar}
              alt={primaryService.title}
              style={{
                width: 96,
                height: 96,
                borderRadius: 14,
                objectFit: 'cover',
                display: 'block',
              }}
            />

            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: 21,
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
                  fontSize: 16,
                  lineHeight: 1.25,
                  fontWeight: 500,
                }}
              >
                {primaryService.title}
              </div>

              <div
                style={{
                  marginTop: 14,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 9,
                  flexWrap: 'wrap',
                  color: BRAND.blue,
                  fontSize: 14,
                  fontWeight: 800,
                }}
              >
                <span>📅 {date}</span>
                <span style={{ color: '#c8cdd7' }}>|</span>
                <span>🕒 {time}</span>
                <span style={{ color: '#c8cdd7' }}>|</span>
                <span>⏱ {formatMinutes(totalMinutes, language)}</span>
              </div>
            </div>

            <div
              style={{
                fontSize: 24,
                fontWeight: 900,
                color: BRAND.navy,
                whiteSpace: 'nowrap',
              }}
            >
              {formatDisplayPrice(totalPrice)}
            </div>
          </div>
        </section>

        <section
          style={{
            marginTop: 18,
            borderRadius: 18,
            border: `2px solid ${BRAND.border}`,
            background: '#ffffff',
            padding: 14,
            boxShadow: '0 8px 22px rgba(7,27,70,0.06)',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '52px 1fr',
              gap: 12,
              alignItems: 'center',
            }}
          >
            <SmallIcon icon="⏳" color={BRAND.blue} />

            <div>
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 900,
                  color: BRAND.navy,
                }}
              >
                {text.waitingConfirmation}
              </div>

              <div
                style={{
                  marginTop: 6,
                  fontSize: 14,
                  lineHeight: 1.45,
                  color: '#515866',
                  fontWeight: 700,
                }}
              >
                {text.waitingText}
              </div>
            </div>
          </div>

          <div
            style={{
              marginTop: 14,
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              border: '1.5px solid #d9dee8',
              borderRadius: 18,
              overflow: 'hidden',
            }}
          >
            <div style={{ padding: 14 }}>
              <div style={{ fontSize: 13, color: '#6f7582', fontWeight: 800 }}>
                {text.depositPaid}
              </div>
              <div
                style={{
                  marginTop: 3,
                  fontSize: 27,
                  color: BRAND.navy,
                  fontWeight: 900,
                }}
              >
                {formatDisplayPrice(safeDepositAmount)}
              </div>
            </div>

            <div
              style={{
                padding: 14,
                borderLeft: '1.5px solid #d9dee8',
                background: '#f5f7fb',
              }}
            >
              <div style={{ fontSize: 13, color: '#6f7582', fontWeight: 800 }}>
                {text.paymentMethod}
              </div>
              <div
                style={{
                  marginTop: 4,
                  fontSize: 16,
                  lineHeight: 1.3,
                  color: paymentMethod === 'olacash' ? BRAND.green : BRAND.blue,
                  fontWeight: 900,
                }}
              >
                {paymentMethodLabel}
              </div>
            </div>
          </div>
        </section>

        <section
          style={{
            marginTop: 18,
            borderRadius: 18,
            border: `2px solid ${BRAND.border}`,
            background: '#ffffff',
            padding: 14,
            boxShadow: '0 8px 22px rgba(7,27,70,0.06)',
          }}
        >
          <div
            style={{
              fontSize: 24,
              lineHeight: 1.1,
              fontWeight: 900,
              color: BRAND.navy,
              marginBottom: 14,
            }}
          >
            {text.bookingDetails}
          </div>

          <div
            style={{
              display: 'grid',
              gap: 10,
              color: '#515866',
              fontSize: 14,
              fontWeight: 700,
            }}
          >
            <div>
              {text.date}: <span style={{ color: BRAND.blue, fontWeight: 900 }}>{date}</span>
            </div>
            <div>
              {text.time}: <span style={{ color: BRAND.blue, fontWeight: 900 }}>{time}</span>
            </div>
            <div>
              {text.status}:{' '}
              <span style={{ color: BRAND.green, fontWeight: 900 }}>
                {text.waitingConfirmation}
              </span>
            </div>
            <div>
              {text.totalDuration}:{' '}
              <span style={{ color: BRAND.navy, fontWeight: 900 }}>
                {formatMinutes(totalMinutes, language)}
              </span>
            </div>
            <div>
              {text.totalPrice}:{' '}
              <span style={{ color: BRAND.navy, fontWeight: 900 }}>
                {formatDisplayPrice(totalPrice)}
              </span>
            </div>
          </div>
        </section>

        <section
          style={{
            marginTop: 18,
            borderRadius: 18,
            border: `2px solid ${BRAND.border}`,
            background: '#ffffff',
            padding: 14,
            boxShadow: '0 8px 22px rgba(7,27,70,0.06)',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '72px 1fr',
              gap: 14,
              alignItems: 'center',
              marginBottom: 14,
            }}
          >
            <img
              src={master.avatar || primaryService.image}
              alt={master.name}
              style={{
                width: 72,
                height: 72,
                borderRadius: 18,
                objectFit: 'cover',
                display: 'block',
              }}
            />

            <div>
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 900,
                  color: BRAND.navy,
                }}
              >
                {master.name}
              </div>

              <div
                style={{
                  marginTop: 6,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  borderRadius: 999,
                  padding: '8px 12px',
                  background: '#edf9ef',
                  color: BRAND.green,
                  fontSize: 12,
                  fontWeight: 900,
                }}
              >
                💬 {text.chatAvailable}
              </div>
            </div>
          </div>

          <div
            style={{
              fontSize: 24,
              lineHeight: 1.1,
              fontWeight: 900,
              color: BRAND.navy,
              marginBottom: 14,
            }}
          >
            {text.specialistContacts}
          </div>

          <div style={{ display: 'grid', gap: 10 }}>
            {[
              { label: text.address, value: text.locked, icon: '📍', color: BRAND.red },
              { label: text.phone, value: text.locked, icon: '☎', color: BRAND.green },
              { label: text.email, value: text.locked, icon: '✉', color: BRAND.blue },
              { label: text.social, value: text.locked, icon: '💬', color: BRAND.pink },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  borderRadius: 16,
                  background: '#f5f7fb',
                  border: '1.5px solid #d8dde8',
                  padding: '12px 12px',
                  display: 'grid',
                  gridTemplateColumns: '44px 1fr',
                  gap: 12,
                  alignItems: 'center',
                  opacity: 0.72,
                }}
              >
                <SmallIcon icon={item.icon} color={item.color} />

                <div>
                  <div
                    style={{
                      fontSize: 12,
                      color: '#6f7582',
                      fontWeight: 800,
                    }}
                  >
                    {item.label}
                  </div>
                  <div
                    style={{
                      marginTop: 4,
                      fontSize: 15,
                      lineHeight: 1.4,
                      color: BRAND.navy,
                      fontWeight: 900,
                    }}
                  >
                    🔒 {item.value}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              marginTop: 12,
              borderRadius: 16,
              background: '#f5f7fb',
              padding: '12px 14px',
              fontSize: 13,
              color: BRAND.blue,
              fontWeight: 900,
              lineHeight: 1.45,
            }}
          >
            {text.routeLocked}
          </div>
        </section>

        <div
          style={{
            display: 'grid',
            gap: 12,
            marginTop: 20,
          }}
        >
          <button
            type="button"
            onClick={() => router.push(`/messages?masterId=${master.id}`)}
            style={{
              border: `2px solid ${BRAND.border}`,
              background: BRAND.green,
              color: '#ffffff',
              borderRadius: 18,
              padding: '18px 22px',
              fontWeight: 900,
              fontSize: 18,
              cursor: 'pointer',
            }}
          >
            💬 {text.writeToSeller}
          </button>

          <button
            type="button"
            disabled
            style={{
              border: '1.5px solid #d8dde8',
              background: '#f3f4f6',
              color: '#9ca3af',
              borderRadius: 18,
              padding: '18px 22px',
              fontWeight: 900,
              fontSize: 17,
              cursor: 'not-allowed',
            }}
          >
            📍 {text.buildRoute}
          </button>

          <button
            type="button"
            disabled
            style={{
              border: '1.5px solid #d8dde8',
              background: '#f3f4f6',
              color: '#9ca3af',
              borderRadius: 18,
              padding: '18px 22px',
              fontWeight: 900,
              fontSize: 17,
              cursor: 'not-allowed',
            }}
          >
            ☎ {text.callSeller}
          </button>

          <button
            type="button"
            onClick={() => router.push('/bookings')}
            style={{
              border: `2px solid ${BRAND.border}`,
              background: '#ffffff',
              color: BRAND.navy,
              borderRadius: 18,
              padding: '18px 22px',
              fontWeight: 900,
              fontSize: 17,
              cursor: 'pointer',
            }}
          >
            {text.myBookings}
          </button>

          <button
            type="button"
            onClick={() => router.push('/')}
            style={{
              border: '1.5px solid #d8dde8',
              background: '#ffffff',
              color: BRAND.navy,
              borderRadius: 18,
              padding: '18px 22px',
              fontWeight: 900,
              fontSize: 17,
              cursor: 'pointer',
            }}
          >
            {text.goHome}
          </button>
        </div>
      </div>
    </main>
  );
}
