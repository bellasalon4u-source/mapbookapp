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

type RegistrationMode = 'quick' | 'full';

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
  light: '#f5f7fb',
};

function getTexts(language: AppLanguage) {
  if (language === 'RU') {
    return {
      masterNotFound: 'Специалист не найден',
      selectedServicesNotFound: 'Выбранные услуги не найдены',
      yourDetails: 'Ваши данные',
      yourDetailsSub: 'Заполните контакты для подтверждения бронирования',
      selectedService: 'Выбранная услуга',
      totalDuration: 'Длительность',
      totalPrice: 'Цена',
      firstName: 'Имя',
      lastName: 'Фамилия',
      phone: 'Телефон',
      email: 'Email',
      whatsapp: 'WhatsApp',
      telegram: 'Telegram',
      instagram: 'Instagram',
      note: 'Комментарий для мастера',
      notePlaceholder: 'Например: пожелания, детали услуги, важные пометки',
      nextStep: 'Следующий шаг',
      holdDeposit: 'Внести депозит',
      continue: 'Продолжить',
      required: 'Обязательно',
      optional: 'Необязательно',
      phoneCode: 'Код',
      registrationType: 'Тип бронирования',
      quickBooking: 'Быстрая',
      quickBookingText: 'Минимум данных. Мастер сможет писать только в чате Olamep.',
      fullBooking: 'Полная',
      fullBookingText: 'Контакты откроются мастеру только после подтверждения и оплаты.',
      quickBadge: 'Только чат',
      fullBadge: 'Контакты после подтверждения',
      protectionTitle: 'Контакты защищены',
      protectionText:
        'Телефон, соцсети и прямые контакты не открываются сразу. До подтверждения мастером доступен только чат внутри Olamep.',
      paymentHint: 'Дальше откроется экран оплаты депозита.',
      message: 'Сообщения',
      bookingDetails: 'Booking details',
      contactDetails: 'Contact details',
      quickInfo: 'Fast booking',
      fullInfo: 'Full registration',
      chatOnly: 'Chat only',
      protectedContacts: 'Protected contacts',
      date: 'Дата',
      time: 'Время',
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
      yourDetails: 'Ваші дані',
      yourDetailsSub: 'Заповніть контакти для підтвердження бронювання',
      selectedService: 'Обрана послуга',
      totalDuration: 'Тривалість',
      totalPrice: 'Ціна',
      firstName: 'Ім’я',
      lastName: 'Прізвище',
      phone: 'Телефон',
      email: 'Email',
      whatsapp: 'WhatsApp',
      telegram: 'Telegram',
      instagram: 'Instagram',
      note: 'Коментар для майстра',
      notePlaceholder: 'Наприклад: побажання, деталі послуги, важливі нотатки',
      nextStep: 'Наступний крок',
      holdDeposit: 'Внести депозит',
      continue: 'Продовжити',
      required: 'Обов’язково',
      optional: 'Необов’язково',
      phoneCode: 'Код',
      registrationType: 'Тип бронювання',
      quickBooking: 'Швидка',
      quickBookingText: 'Мінімум даних. Майстер зможе писати тільки в чаті Olamep.',
      fullBooking: 'Повна',
      fullBookingText: 'Контакти відкриються майстру тільки після підтвердження та оплати.',
      quickBadge: 'Тільки чат',
      fullBadge: 'Контакти після підтвердження',
      protectionTitle: 'Контакти захищено',
      protectionText:
        'Телефон, соцмережі та прямі контакти не відкриваються одразу. До підтвердження майстром доступний тільки чат в Olamep.',
      paymentHint: 'Далі відкриється екран оплати депозиту.',
      message: 'Повідомлення',
      bookingDetails: 'Booking details',
      contactDetails: 'Contact details',
      quickInfo: 'Fast booking',
      fullInfo: 'Full registration',
      chatOnly: 'Chat only',
      protectedContacts: 'Protected contacts',
      date: 'Дата',
      time: 'Час',
      providerFallback: 'Спеціаліст',
      serviceProviderFallback: 'Виконавець послуг',
      serviceFallback: 'Основна послуга',
      premiumOption: 'Преміум варіант',
    };
  }

  return {
    masterNotFound: 'Provider not found',
    selectedServicesNotFound: 'Selected services not found',
    yourDetails: 'Your details',
    yourDetailsSub: 'Fill in your contacts to confirm the booking',
    selectedService: 'Selected service',
    totalDuration: 'Duration',
    totalPrice: 'Price',
    firstName: 'First name',
    lastName: 'Last name',
    phone: 'Phone',
    email: 'Email',
    whatsapp: 'WhatsApp',
    telegram: 'Telegram',
    instagram: 'Instagram',
    note: 'Note for provider',
    notePlaceholder: 'Preferences, service details or important notes',
    nextStep: 'Next step',
    holdDeposit: 'Hold deposit',
    continue: 'Continue',
    required: 'Required',
    optional: 'Optional',
    phoneCode: 'Code',
    registrationType: 'Booking type',
    quickBooking: 'Quick',
    quickBookingText: 'Minimum details. The provider can contact you only via Olamep chat.',
    fullBooking: 'Full',
    fullBookingText: 'Contacts unlock for the provider only after confirmation and payment.',
    quickBadge: 'Chat only',
    fullBadge: 'Contacts after confirmation',
    protectionTitle: 'Contacts protected',
    protectionText:
      'Phone, social links and direct contacts are not opened immediately. Before provider confirmation, only in-app chat is available.',
    paymentHint: 'Next you will open the deposit payment screen.',
    message: 'Messages',
    bookingDetails: 'Booking details',
    contactDetails: 'Contact details',
    quickInfo: 'Fast booking',
    fullInfo: 'Full registration',
    chatOnly: 'Chat only',
    protectedContacts: 'Protected contacts',
    date: 'Date',
    time: 'Time',
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

function inputStyle() {
  return {
    width: '100%',
    height: 56,
    padding: '0 15px',
    borderRadius: 16,
    border: `1.5px solid #d8dde8`,
    fontSize: 16,
    outline: 'none',
    background: '#ffffff',
    boxSizing: 'border-box' as const,
    color: BRAND.navy,
    fontWeight: 700,
  };
}

function FieldLabel({ label, helper }: { label: string; helper?: string }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 10,
        marginBottom: 8,
      }}
    >
      <span
        style={{
          fontSize: 14,
          fontWeight: 900,
          color: BRAND.navy,
        }}
      >
        {label}
      </span>

      {helper ? (
        <span
          style={{
            fontSize: 12,
            fontWeight: 800,
            color: BRAND.muted,
          }}
        >
          {helper}
        </span>
      ) : null}
    </div>
  );
}

function ContactIcon({ icon, color }: { icon: string; color: string }) {
  return (
    <div
      style={{
        width: 38,
        height: 38,
        borderRadius: 14,
        background: color,
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 19,
        fontWeight: 900,
        flex: '0 0 auto',
      }}
    >
      {icon}
    </div>
  );
}

export default function BookingDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [language, setLanguage] = useState<AppLanguage>(getSavedLanguage());

  const text = useMemo(() => getTexts(language), [language]);
  const id = String(params.id);

  const servicesParam = searchParams.get('services') || '';
  const date = searchParams.get('date') || '';
  const time = searchParams.get('time') || '';

  const [registrationMode, setRegistrationMode] = useState<RegistrationMode>('quick');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [countryCode] = useState('+44');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [telegram, setTelegram] = useState('');
  const [instagram, setInstagram] = useState('');
  const [clientNote, setClientNote] = useState('');

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

  const quickValid =
    firstName.trim().length > 0 && lastName.trim().length > 0 && phone.trim().length > 0;

  const fullValid =
    quickValid &&
    email.trim().length > 0 &&
    (whatsapp.trim().length > 0 || telegram.trim().length > 0 || instagram.trim().length > 0);

  const isValid = registrationMode === 'quick' ? quickValid : fullValid;

  const safePhone = `${countryCode} ${phone}`.trim();
  const safeWhatsapp = whatsapp.trim() || safePhone;

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
            {text.yourDetails}
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
            {text.yourDetailsSub}
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
            padding: 12,
            boxShadow: '0 8px 22px rgba(7,27,70,0.06)',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              border: '1.5px solid #d9dee8',
              borderRadius: 18,
              overflow: 'hidden',
              background: '#ffffff',
            }}
          >
            {([
              {
                key: 'quick',
                title: text.quickBooking,
                body: text.quickBookingText,
                badge: text.quickBadge,
                icon: '💬',
                activeColor: BRAND.green,
              },
              {
                key: 'full',
                title: text.fullBooking,
                body: text.fullBookingText,
                badge: text.fullBadge,
                icon: '🔐',
                activeColor: BRAND.blue,
              },
            ] as const).map((item, index) => {
              const active = registrationMode === item.key;

              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setRegistrationMode(item.key)}
                  style={{
                    border: 0,
                    borderRight: index === 0 ? '1.5px solid #d9dee8' : 0,
                    background: active ? '#f4f8ff' : '#ffffff',
                    padding: 12,
                    minHeight: 142,
                    textAlign: 'left',
                    cursor: 'pointer',
                    color: BRAND.navy,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 8,
                    }}
                  >
                    <ContactIcon icon={item.icon} color={item.activeColor} />

                    <div
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: 999,
                        background: active ? item.activeColor : '#ffffff',
                        border: active ? `2px solid ${item.activeColor}` : '2px solid #cfd4dd',
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
                  </div>

                  <div
                    style={{
                      marginTop: 10,
                      fontSize: 18,
                      lineHeight: 1.1,
                      fontWeight: 900,
                      color: BRAND.navy,
                    }}
                  >
                    {item.title}
                  </div>

                  <div
                    style={{
                      marginTop: 6,
                      fontSize: 12,
                      lineHeight: 1.35,
                      fontWeight: 700,
                      color: '#515866',
                    }}
                  >
                    {item.body}
                  </div>

                  <div
                    style={{
                      marginTop: 10,
                      display: 'inline-flex',
                      borderRadius: 999,
                      padding: '6px 9px',
                      background: active ? item.activeColor : '#f1f3f7',
                      color: active ? '#ffffff' : '#626977',
                      fontSize: 10,
                      fontWeight: 900,
                    }}
                  >
                    {item.badge}
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
            {text.contactDetails}
          </div>

          <div style={{ display: 'grid', gap: 15 }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 12,
              }}
            >
              <label style={{ display: 'block' }}>
                <FieldLabel label={text.firstName} helper={text.required} />
                <input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder={text.firstName}
                  style={inputStyle()}
                />
              </label>

              <label style={{ display: 'block' }}>
                <FieldLabel label={text.lastName} helper={text.required} />
                <input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder={text.lastName}
                  style={inputStyle()}
                />
              </label>
            </div>

            <label style={{ display: 'block' }}>
              <FieldLabel label={text.phone} helper={text.required} />
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '106px 1fr',
                  gap: 10,
                }}
              >
                <div
                  style={{
                    height: 56,
                    borderRadius: 16,
                    border: '1.5px solid #d8dde8',
                    background: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    fontWeight: 900,
                    color: BRAND.navy,
                    fontSize: 15,
                  }}
                >
                  <span style={{ fontSize: 20 }}>🇬🇧</span>
                  <span>{countryCode}</span>
                </div>

                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={text.phone}
                  inputMode="tel"
                  style={inputStyle()}
                />
              </div>
            </label>

            {registrationMode === 'full' ? (
              <>
                <label style={{ display: 'block' }}>
                  <FieldLabel label={text.email} helper={text.required} />
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={text.email}
                    inputMode="email"
                    style={inputStyle()}
                  />
                </label>

                <label style={{ display: 'block' }}>
                  <FieldLabel label={text.whatsapp} helper={text.optional} />
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <ContactIcon icon="☎" color={BRAND.green} />
                    <input
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      placeholder="+44..."
                      inputMode="tel"
                      style={inputStyle()}
                    />
                  </div>
                </label>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 12,
                  }}
                >
                  <label style={{ display: 'block' }}>
                    <FieldLabel label={text.telegram} helper={text.optional} />
                    <input
                      value={telegram}
                      onChange={(e) => setTelegram(e.target.value)}
                      placeholder="@username"
                      style={inputStyle()}
                    />
                  </label>

                  <label style={{ display: 'block' }}>
                    <FieldLabel label={text.instagram} helper={text.optional} />
                    <input
                      value={instagram}
                      onChange={(e) => setInstagram(e.target.value)}
                      placeholder="@username"
                      style={inputStyle()}
                    />
                  </label>
                </div>
              </>
            ) : null}

            <label style={{ display: 'block' }}>
              <FieldLabel label={text.note} helper={text.optional} />
              <textarea
                value={clientNote}
                onChange={(e) => setClientNote(e.target.value)}
                placeholder={text.notePlaceholder}
                rows={4}
                style={{
                  width: '100%',
                  borderRadius: 16,
                  border: '1.5px solid #d8dde8',
                  padding: 14,
                  outline: 'none',
                  resize: 'none',
                  fontFamily: 'Arial, sans-serif',
                  fontSize: 15,
                  lineHeight: 1.4,
                  fontWeight: 700,
                  color: BRAND.navy,
                  boxSizing: 'border-box',
                }}
              />
            </label>
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
              gridTemplateColumns: '42px 1fr',
              gap: 12,
              alignItems: 'center',
            }}
          >
            <ContactIcon icon="🔒" color={BRAND.yellow} />

            <div>
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 900,
                  color: BRAND.navy,
                }}
              >
                {text.protectionTitle}
              </div>

              <div
                style={{
                  marginTop: 6,
                  fontSize: 13,
                  fontWeight: 700,
                  lineHeight: 1.45,
                  color: '#515866',
                }}
              >
                {text.protectionText}
              </div>

              <div
                style={{
                  marginTop: 8,
                  fontSize: 13,
                  fontWeight: 900,
                  color: BRAND.blue,
                }}
              >
                {text.paymentHint}
              </div>
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
                  {text.nextStep}
                </div>
                <div
                  style={{
                    marginTop: 2,
                    fontSize: 20,
                    color: BRAND.navy,
                    fontWeight: 900,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {text.holdDeposit}
                </div>
              </div>
            </div>

            <div style={{ height: 46, background: '#d9dee8' }} />

            <button
              type="button"
              disabled={!isValid}
              onClick={() => {
                if (!isValid) return;

                router.push(
                  `/booking/${master.id}/payment?services=${encodeURIComponent(
                    selectedServiceSlugs.join(',')
                  )}&date=${encodeURIComponent(date)}&time=${encodeURIComponent(
                    time
                  )}&firstName=${encodeURIComponent(firstName)}&lastName=${encodeURIComponent(
                    lastName
                  )}&phone=${encodeURIComponent(safePhone)}&email=${encodeURIComponent(
                    registrationMode === 'full' ? email : ''
                  )}&whatsapp=${encodeURIComponent(
                    registrationMode === 'full' ? safeWhatsapp : ''
                  )}&telegram=${encodeURIComponent(
                    registrationMode === 'full' ? telegram : ''
                  )}&instagram=${encodeURIComponent(
                    registrationMode === 'full' ? instagram : ''
                  )}&note=${encodeURIComponent(clientNote)}&registrationMode=${registrationMode}`
                );
              }}
              style={{
                height: 74,
                border: 0,
                background: isValid ? BRAND.green : '#b7d9bf',
                color: '#ffffff',
                fontWeight: 900,
                fontSize: 20,
                cursor: isValid ? 'pointer' : 'not-allowed',
              }}
            >
              {text.continue} →
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
