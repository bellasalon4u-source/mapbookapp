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

const BOOKING_DEPOSIT = 1;
const OLACASH_STORAGE_KEY = 'olamep_olacash_balance';

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

function getStoredOlaCashBalance() {
  if (typeof window === 'undefined') return 0;

  const saved = window.localStorage.getItem(OLACASH_STORAGE_KEY);
  const parsed = Number(saved);

  if (!Number.isFinite(parsed)) return 0;

  return parsed;
}

function saveStoredOlaCashBalance(value: number) {
  if (typeof window === 'undefined') return;

  window.localStorage.setItem(OLACASH_STORAGE_KEY, String(Math.max(0, value)));
  window.dispatchEvent(new CustomEvent('olamep:olacash-change'));
}

function getTexts(language: AppLanguage) {
  if (language === 'RU') {
    return {
      masterNotFound: 'Специалист не найден',
      selectedServicesNotFound: 'Выбранные услуги не найдены',
      holdDeposit: 'Оплата депозита',
      subtitle: 'Депозит защищает бронь внутри Olamep',
      selectedProcedure: 'Выбранная услуга',
      totalDuration: 'Длительность',
      totalPrice: 'Цена',
      holdInfoLine1: '£1 будет временно заморожен для подтверждения брони.',
      holdInfoLine2: 'Контакты и точный адрес не откроются, пока мастер не подтвердит бронь.',
      date: 'Дата',
      time: 'Время',
      customer: 'Клиент',
      phone: 'Телефон',
      email: 'Email',
      social: 'Соцсети',
      secureBookingFee: 'Безопасный депозит',
      holdDepositButton: 'Оплатить £1',
      emptyValue: '—',
      choosePaymentMethod: 'Метод оплаты',
      protectedPayment: 'Защищённая оплата',
      protectedPaymentSub: 'После оплаты заявка уйдёт мастеру на подтверждение',
      olacash: 'OlaCash',
      olacashBalance: 'Баланс OlaCash',
      notEnoughOlaCash: 'Недостаточно OlaCash',
      card: 'Банковская карта',
      paypal: 'PayPal',
      appleGoogle: 'Apple Pay / Google Pay',
      paymentReady: 'Готово к оплате',
      bookingSummary: 'Сводка бронирования',
      paymentWillUnlock: 'Контакты откроются только после подтверждения мастером',
      message: 'Сообщения',
      providerFallback: 'Специалист',
      serviceProviderFallback: 'Исполнитель услуг',
      serviceFallback: 'Основная услуга',
      premiumOption: 'Премиум вариант',
    };
  }

  if (language === 'UA') {
    return {
      masterNotFound: 'Спеціаліста не знайдено',
      selectedServicesNotFound: 'Вибрані послуги не знайдено',
      holdDeposit: 'Оплата депозиту',
      subtitle: 'Депозит захищає бронювання всередині Olamep',
      selectedProcedure: 'Обрана послуга',
      totalDuration: 'Тривалість',
      totalPrice: 'Ціна',
      holdInfoLine1: '£1 буде тимчасово заморожено для підтвердження бронювання.',
      holdInfoLine2: 'Контакти й точна адреса не відкриються, поки майстер не підтвердить бронювання.',
      date: 'Дата',
      time: 'Час',
      customer: 'Клієнт',
      phone: 'Телефон',
      email: 'Email',
      social: 'Соцмережі',
      secureBookingFee: 'Безпечний депозит',
      holdDepositButton: 'Оплатити £1',
      emptyValue: '—',
      choosePaymentMethod: 'Метод оплати',
      protectedPayment: 'Захищена оплата',
      protectedPaymentSub: 'Після оплати заявка піде майстру на підтвердження',
      olacash: 'OlaCash',
      olacashBalance: 'Баланс OlaCash',
      notEnoughOlaCash: 'Недостатньо OlaCash',
      card: 'Банківська карта',
      paypal: 'PayPal',
      appleGoogle: 'Apple Pay / Google Pay',
      paymentReady: 'Готово до оплати',
      bookingSummary: 'Підсумок бронювання',
      paymentWillUnlock: 'Контакти відкриються тільки після підтвердження майстром',
      message: 'Повідомлення',
      providerFallback: 'Спеціаліст',
      serviceProviderFallback: 'Виконавець послуг',
      serviceFallback: 'Основна послуга',
      premiumOption: 'Преміум варіант',
    };
  }

  return {
    masterNotFound: 'Provider not found',
    selectedServicesNotFound: 'Selected services not found',
    holdDeposit: 'Deposit payment',
    subtitle: 'Your deposit keeps the booking protected inside Olamep',
    selectedProcedure: 'Selected service',
    totalDuration: 'Duration',
    totalPrice: 'Price',
    holdInfoLine1: '£1 will be temporarily held to confirm your booking.',
    holdInfoLine2: 'Contacts and exact address will not unlock until the provider confirms.',
    date: 'Date',
    time: 'Time',
    customer: 'Customer',
    phone: 'Phone',
    email: 'Email',
    social: 'Social',
    secureBookingFee: 'Secure deposit',
    holdDepositButton: 'Pay £1',
    emptyValue: '—',
    choosePaymentMethod: 'Payment method',
    protectedPayment: 'Protected payment',
    protectedPaymentSub: 'After payment, your request goes to the provider for confirmation',
    olacash: 'OlaCash',
    olacashBalance: 'OlaCash balance',
    notEnoughOlaCash: 'Not enough OlaCash',
    card: 'Bank card',
    paypal: 'PayPal',
    appleGoogle: 'Apple Pay / Google Pay',
    paymentReady: 'Ready to pay',
    bookingSummary: 'Booking summary',
    paymentWillUnlock: 'Contacts unlock only after provider confirmation',
    message: 'Messages',
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

function PaymentIcon({ type }: { type: PaymentMethod | 'shield' }) {
  const baseStyle = {
    width: 52,
    height: 52,
    borderRadius: 16,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative' as const,
    flex: '0 0 auto',
    boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.65)',
  };

  if (type === 'shield') {
    return (
      <div style={{ ...baseStyle, background: BRAND.green }}>
        <div
          style={{
            width: 25,
            height: 30,
            borderRadius: '14px 14px 18px 18px',
            border: '3px solid #ffffff',
            position: 'relative',
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: 7,
              top: 6,
              width: 8,
              height: 14,
              borderRight: '3px solid #ffffff',
              borderBottom: '3px solid #ffffff',
              transform: 'rotate(40deg)',
            }}
          />
        </div>
      </div>
    );
  }

  if (type === 'olacash') {
    return (
      <div style={{ ...baseStyle, background: '#eaf9ef' }}>
        <div
          style={{
            width: 26,
            height: 26,
            borderRadius: 999,
            background: 'linear-gradient(180deg, #9be3ad 0%, #61c87b 100%)',
            border: '2px solid #ffffff',
            boxShadow: '0 4px 10px rgba(33,184,75,0.22)',
          }}
        />
      </div>
    );
  }

  if (type === 'card') {
    return (
      <div style={{ ...baseStyle, background: BRAND.pink }}>
        <div
          style={{
            width: 34,
            height: 23,
            borderRadius: 5,
            background: '#ffd629',
            border: '2px solid #071b46',
            position: 'relative',
            boxShadow: '0 4px 8px rgba(7,27,70,0.18)',
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: 6,
              height: 4,
              background: '#071b46',
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: 5,
              bottom: 4,
              width: 12,
              height: 2,
              borderRadius: 999,
              background: '#071b46',
            }}
          />
        </div>
      </div>
    );
  }

  if (type === 'paypal') {
    return (
      <div style={{ ...baseStyle, background: BRAND.blue }}>
        <div
          style={{
            color: '#ffffff',
            fontSize: 33,
            lineHeight: 1,
            fontWeight: 900,
            fontFamily: 'Arial, sans-serif',
          }}
        >
          P
        </div>
      </div>
    );
  }

  return (
    <div style={{ ...baseStyle, background: BRAND.navy }}>
      <div
        style={{
          width: 22,
          height: 34,
          borderRadius: 6,
          background: '#111827',
          border: '2px solid #ffffff',
          padding: 3,
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 2,
        }}
      >
        {[
          '#ff4b4b',
          '#ffd629',
          '#21b84b',
          '#1467f2',
          '#ffffff',
          '#ff4f9a',
          '#21b84b',
          '#ffd629',
          '#1467f2',
        ].map((color, index) => (
          <span
            key={index}
            style={{
              width: 3,
              height: 3,
              borderRadius: 1,
              background: color,
              display: 'block',
            }}
          />
        ))}
      </div>
    </div>
  );
}

function getPaymentAccent(method: PaymentMethod) {
  if (method === 'card') return BRAND.pink;
  if (method === 'paypal') return BRAND.blue;
  if (method === 'wallet') return BRAND.navy;
  return BRAND.green;
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

export default function BookingPaymentPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [language, setLanguage] = useState<AppLanguage>(getSavedLanguage());
  const [olaCashBalance, setOlaCashBalance] = useState(0);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('card');

  const text = useMemo(() => getTexts(language), [language]);
  const id = String(params.id);

  const servicesParam = searchParams.get('services') || '';
  const date = searchParams.get('date') || '';
  const time = searchParams.get('time') || '';
  const firstName = searchParams.get('firstName') || '';
  const lastName = searchParams.get('lastName') || '';
  const phone = searchParams.get('phone') || '';
  const email = searchParams.get('email') || '';
  const whatsapp = searchParams.get('whatsapp') || '';
  const telegram = searchParams.get('telegram') || '';
  const instagram = searchParams.get('instagram') || '';
  const registrationMode = searchParams.get('registrationMode') || 'quick';

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

  useEffect(() => {
    const syncOlaCash = () => {
      const balance = getStoredOlaCashBalance();
      setOlaCashBalance(balance);

      if (balance >= BOOKING_DEPOSIT) {
        setSelectedMethod('olacash');
      } else {
        setSelectedMethod('card');
      }
    };

    syncOlaCash();

    window.addEventListener('focus', syncOlaCash);
    window.addEventListener('storage', syncOlaCash);
    window.addEventListener('olamep:olacash-change', syncOlaCash as EventListener);

    return () => {
      window.removeEventListener('focus', syncOlaCash);
      window.removeEventListener('storage', syncOlaCash);
      window.removeEventListener('olamep:olacash-change', syncOlaCash as EventListener);
    };
  }, []);

  if (!master) {
    return (
      <main style={{ padding: 24, fontFamily: 'Arial, sans-serif', color: BRAND.navy }}>
        {text.masterNotFound}
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
        {text.selectedServicesNotFound}
      </main>
    );
  }

  const totalPrice = selectedItems.reduce((sum, item) => sum + item.price, 0);
  const totalMinutes = selectedItems.reduce(
    (sum, item) => sum + parseDurationToMinutes(item.duration),
    0
  );

  const primaryService = selectedItems[0];
  const canUseOlaCash = olaCashBalance >= BOOKING_DEPOSIT;

  const goToConfirmed = () => {
    if (selectedMethod === 'olacash' && canUseOlaCash) {
      saveStoredOlaCashBalance(olaCashBalance - BOOKING_DEPOSIT);
    }

    router.push(
      `/booking/${master.id}/confirmed?services=${encodeURIComponent(
        selectedServiceSlugs.join(',')
      )}&date=${encodeURIComponent(date)}&time=${encodeURIComponent(
        time
      )}&firstName=${encodeURIComponent(firstName)}&lastName=${encodeURIComponent(
        lastName
      )}&phone=${encodeURIComponent(phone)}&email=${encodeURIComponent(
        email
      )}&whatsapp=${encodeURIComponent(whatsapp)}&telegram=${encodeURIComponent(
        telegram
      )}&instagram=${encodeURIComponent(instagram)}&registrationMode=${encodeURIComponent(
        registrationMode
      )}&paymentMethod=${encodeURIComponent(selectedMethod)}&deposit=${encodeURIComponent(
        String(BOOKING_DEPOSIT)
      )}&status=pending_master_confirmation`
    );
  };

  const paymentMethods = [
    {
      id: 'olacash' as PaymentMethod,
      title: text.olacash,
      subtitle: canUseOlaCash
        ? `${text.olacashBalance}: ${formatDisplayPrice(olaCashBalance)}`
        : text.notEnoughOlaCash,
      disabled: !canUseOlaCash,
    },
    {
      id: 'card' as PaymentMethod,
      title: text.card,
      subtitle: 'Visa • Mastercard',
      disabled: false,
    },
    {
      id: 'paypal' as PaymentMethod,
      title: text.paypal,
      subtitle: 'PayPal checkout',
      disabled: false,
    },
    {
      id: 'wallet' as PaymentMethod,
      title: text.appleGoogle,
      subtitle: 'Mobile wallet',
      disabled: false,
    },
  ];

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#ffffff',
        fontFamily: 'Arial, sans-serif',
        color: BRAND.navy,
        paddingBottom: 126,
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
            {text.holdDeposit}
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
            <PaymentIcon type="shield" />

            <div>
              <div style={{ fontSize: 22, fontWeight: 900, color: BRAND.navy }}>
                {text.protectedPayment}
              </div>
              <div
                style={{
                  marginTop: 5,
                  fontSize: 14,
                  lineHeight: 1.45,
                  color: '#515866',
                  fontWeight: 700,
                }}
              >
                {text.protectedPaymentSub}
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
                {text.secureBookingFee}
              </div>
              <div
                style={{
                  marginTop: 3,
                  fontSize: 28,
                  color: BRAND.navy,
                  fontWeight: 900,
                }}
              >
                {formatDisplayPrice(BOOKING_DEPOSIT)}
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
                {text.paymentReady}
              </div>
              <div
                style={{
                  marginTop: 4,
                  fontSize: 15,
                  lineHeight: 1.3,
                  color: BRAND.blue,
                  fontWeight: 900,
                }}
              >
                {text.paymentWillUnlock}
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
            {text.choosePaymentMethod}
          </div>

          <div style={{ display: 'grid', gap: 10 }}>
            {paymentMethods.map((method) => {
              const active = selectedMethod === method.id;
              const accent = getPaymentAccent(method.id);

              return (
                <button
                  key={method.id}
                  type="button"
                  disabled={method.disabled}
                  onClick={() => {
                    if (method.disabled) return;
                    setSelectedMethod(method.id);
                  }}
                  style={{
                    width: '100%',
                    borderRadius: 16,
                    border: active ? `2px solid ${accent}` : '1.5px solid #d8dde8',
                    background: active ? '#f4f8ff' : '#ffffff',
                    padding: 12,
                    display: 'grid',
                    gridTemplateColumns: '52px 1fr auto',
                    gap: 12,
                    alignItems: 'center',
                    textAlign: 'left',
                    cursor: method.disabled ? 'not-allowed' : 'pointer',
                    opacity: method.disabled ? 0.55 : 1,
                    boxShadow: active ? '0 8px 18px rgba(20,103,242,0.12)' : 'none',
                  }}
                >
                  <PaymentIcon type={method.id} />

                  <div>
                    <div
                      style={{
                        fontSize: 17,
                        fontWeight: 900,
                        color: BRAND.navy,
                      }}
                    >
                      {method.title}
                    </div>

                    <div
                      style={{
                        marginTop: 4,
                        fontSize: 12,
                        fontWeight: 800,
                        color:
                          method.id === 'olacash' && !canUseOlaCash ? BRAND.red : BRAND.muted,
                      }}
                    >
                      {method.subtitle}
                    </div>
                  </div>

                  <div
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 999,
                      background: active ? accent : '#ffffff',
                      border: active ? `2px solid ${accent}` : '2px solid #cfd4dd',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 17,
                      fontWeight: 900,
                    }}
                  >
                    {active ? '✓' : ''}
                  </div>
                </button>
              );
            })}
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
            {text.bookingSummary}
          </div>

          <div
            style={{
              borderRadius: 16,
              background: '#f5f7fb',
              padding: 14,
              color: '#515866',
              lineHeight: 1.5,
              fontSize: 14,
              fontWeight: 700,
            }}
          >
            <div style={{ color: BRAND.green, fontWeight: 900 }}>{text.holdInfoLine1}</div>
            <div style={{ marginTop: 6, color: BRAND.blue, fontWeight: 900 }}>
              {text.holdInfoLine2}
            </div>
          </div>

          <div
            style={{
              marginTop: 14,
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
              {text.customer}:{' '}
              <span style={{ color: BRAND.navy, fontWeight: 900 }}>
                {firstName} {lastName}
              </span>
            </div>
            <div>
              {text.phone}: <span style={{ color: BRAND.navy, fontWeight: 900 }}>{phone}</span>
            </div>
            <div>
              {text.email}:{' '}
              <span style={{ color: BRAND.navy, fontWeight: 900 }}>
                {email || text.emptyValue}
              </span>
            </div>
            <div>
              {text.social}:{' '}
              <span style={{ color: BRAND.navy, fontWeight: 900 }}>
                {[whatsapp, telegram, instagram].filter(Boolean).join(' • ') || text.emptyValue}
              </span>
            </div>
          </div>
        </section>
      </div>

      <div
        style={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          background: '#ffffff',
          borderTop: '1px solid #e4e7ee',
          padding: '12px 18px calc(14px + env(safe-area-inset-bottom))',
          zIndex: 50,
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
              gridTemplateColumns: '1fr 1.5px 1.25fr',
              alignItems: 'center',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <MessageIcon />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13, color: '#6f7582', fontWeight: 800 }}>
                  {text.secureBookingFee}
                </div>
                <div
                  style={{
                    marginTop: 2,
                    fontSize: 23,
                    color: BRAND.navy,
                    fontWeight: 900,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {formatDisplayPrice(BOOKING_DEPOSIT)}
                </div>
              </div>
            </div>

            <div style={{ height: 46, background: '#d9dee8' }} />

            <button
              type="button"
              onClick={goToConfirmed}
              style={{
                height: 74,
                border: 0,
                background: BRAND.green,
                color: '#ffffff',
                fontWeight: 900,
                fontSize: 20,
                cursor: 'pointer',
              }}
            >
              {text.holdDepositButton} →
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
