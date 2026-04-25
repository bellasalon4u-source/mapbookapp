'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { getMasterById } from '../../../../services/masters';
import {
  getSavedLanguage,
  subscribeToLanguageChange,
  type AppLanguage,
} from '../../../../services/i18n';
import { formatDisplayPrice } from '../../../../services/currencyDisplay';

type RegistrationMode = 'quick' | 'full';

function parseDurationToMinutes(value: string) {
  const hourMatch = value.match(/(\d+)\s*h/i);
  const minuteMatch = value.match(/(\d+)\s*m/i);

  const hours = hourMatch ? Number(hourMatch[1]) : 0;
  const minutes = minuteMatch ? Number(minuteMatch[1]) : 0;

  return hours * 60 + minutes;
}

function formatMinutes(minutes: number, language: AppLanguage) {
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

  if (language === 'ES' || language === 'CZ' || language === 'PL') {
    if (h > 0 && m > 0) return `${h}h ${m}min`;
    if (h > 0) return `${h}h`;
    return `${m}min`;
  }

  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
}

function getTexts(language: AppLanguage) {
  if (language === 'RU') {
    return {
      masterNotFound: 'Специалист не найден',
      selectedServicesNotFound: 'Выбранные услуги не найдены',
      yourDetails: 'Ваши данные',
      yourDetailsSub: 'Заполните контакты для подтверждения бронирования',
      selectedProcedures: 'Выбранные процедуры',
      totalDuration: 'Общая длительность',
      totalPrice: 'Общая цена',
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
      bookingInfo: 'Информация о бронировании',
      required: 'Обязательное поле',
      optional: 'Необязательно',
      contactsProtected: 'Контакты защищены системой Olamep',
      phoneCode: 'Код',
      registrationType: 'Тип бронирования',
      quickBooking: 'Быстрая бронь',
      quickBookingText:
        'Подходит, если клиент не хочет проходить полную регистрацию. Мастер сможет связаться только через чат внутри приложения.',
      fullBooking: 'Полная регистрация',
      fullBookingText:
        'После обоюдного подтверждения мастеру будут доступны телефон, WhatsApp, email и другие контакты, которые вы указали.',
      quickBadge: 'Только чат',
      fullBadge: 'Все контакты после подтверждения',
      protectionTitle: 'Защита контактов',
      protectionText:
        'До подтверждения и оплаты прямые контакты скрыты. Это защищает клиента, мастера и бронирование внутри платформы.',
      clientNote: 'Пометки',
      paymentHint: 'После этого откроется экран оплаты депозита.',
    };
  }

  if (language === 'UA') {
    return {
      masterNotFound: 'Спеціаліста не знайдено',
      selectedServicesNotFound: 'Вибрані послуги не знайдено',
      yourDetails: 'Ваші дані',
      yourDetailsSub: 'Заповніть контакти для підтвердження бронювання',
      selectedProcedures: 'Вибрані процедури',
      totalDuration: 'Загальна тривалість',
      totalPrice: 'Загальна ціна',
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
      bookingInfo: 'Інформація про бронювання',
      required: 'Обов’язкове поле',
      optional: 'Необов’язково',
      contactsProtected: 'Контакти захищені системою Olamep',
      phoneCode: 'Код',
      registrationType: 'Тип бронювання',
      quickBooking: 'Швидка бронь',
      quickBookingText:
        'Підходить, якщо клієнт не хоче проходити повну реєстрацію. Майстер зможе зв’язатися тільки через чат у застосунку.',
      fullBooking: 'Повна реєстрація',
      fullBookingText:
        'Після взаємного підтвердження майстру будуть доступні телефон, WhatsApp, email та інші контакти.',
      quickBadge: 'Тільки чат',
      fullBadge: 'Усі контакти після підтвердження',
      protectionTitle: 'Захист контактів',
      protectionText:
        'До підтвердження й оплати прямі контакти приховані. Це захищає клієнта, майстра і бронювання всередині платформи.',
      clientNote: 'Нотатки',
      paymentHint: 'Після цього відкриється екран оплати депозиту.',
    };
  }

  if (language === 'ES') {
    return {
      masterNotFound: 'Profesional no encontrado',
      selectedServicesNotFound: 'Servicios seleccionados no encontrados',
      yourDetails: 'Tus datos',
      yourDetailsSub: 'Completa tus contactos para confirmar la reserva',
      selectedProcedures: 'Procedimientos seleccionados',
      totalDuration: 'Duración total',
      totalPrice: 'Precio total',
      firstName: 'Nombre',
      lastName: 'Apellido',
      phone: 'Teléfono',
      email: 'Email',
      whatsapp: 'WhatsApp',
      telegram: 'Telegram',
      instagram: 'Instagram',
      note: 'Nota para el profesional',
      notePlaceholder: 'Preferencias, detalles del servicio o notas importantes',
      nextStep: 'Siguiente paso',
      holdDeposit: 'Pagar depósito',
      continue: 'Continuar',
      bookingInfo: 'Información de la reserva',
      required: 'Campo obligatorio',
      optional: 'Opcional',
      contactsProtected: 'Tus contactos están protegidos por Olamep',
      phoneCode: 'Código',
      registrationType: 'Tipo de reserva',
      quickBooking: 'Reserva rápida',
      quickBookingText:
        'Ideal si el cliente no quiere registrarse completamente. El profesional solo podrá contactar por chat interno.',
      fullBooking: 'Registro completo',
      fullBookingText:
        'Tras la confirmación de ambas partes, el profesional verá teléfono, WhatsApp, email y otros contactos indicados.',
      quickBadge: 'Solo chat',
      fullBadge: 'Todos los contactos tras confirmar',
      protectionTitle: 'Protección de contactos',
      protectionText:
        'Antes de la confirmación y el pago, los contactos directos están ocultos.',
      clientNote: 'Notas',
      paymentHint: 'Después se abrirá la pantalla de pago del depósito.',
    };
  }

  if (language === 'CZ') {
    return {
      masterNotFound: 'Specialista nebyl nalezen',
      selectedServicesNotFound: 'Vybrané služby nebyly nalezeny',
      yourDetails: 'Vaše údaje',
      yourDetailsSub: 'Vyplňte kontakty pro potvrzení rezervace',
      selectedProcedures: 'Vybrané procedury',
      totalDuration: 'Celková délka',
      totalPrice: 'Celková cena',
      firstName: 'Jméno',
      lastName: 'Příjmení',
      phone: 'Telefon',
      email: 'Email',
      whatsapp: 'WhatsApp',
      telegram: 'Telegram',
      instagram: 'Instagram',
      note: 'Poznámka pro specialistu',
      notePlaceholder: 'Přání, detaily služby nebo důležité poznámky',
      nextStep: 'Další krok',
      holdDeposit: 'Zaplatit zálohu',
      continue: 'Pokračovat',
      bookingInfo: 'Informace o rezervaci',
      required: 'Povinné pole',
      optional: 'Volitelné',
      contactsProtected: 'Vaše kontakty jsou chráněny systémem Olamep',
      phoneCode: 'Kód',
      registrationType: 'Typ rezervace',
      quickBooking: 'Rychlá rezervace',
      quickBookingText:
        'Vhodné, pokud klient nechce úplnou registraci. Specialista může kontaktovat pouze přes interní chat.',
      fullBooking: 'Úplná registrace',
      fullBookingText:
        'Po potvrzení oběma stranami uvidí specialista telefon, WhatsApp, email a další uvedené kontakty.',
      quickBadge: 'Pouze chat',
      fullBadge: 'Všechny kontakty po potvrzení',
      protectionTitle: 'Ochrana kontaktů',
      protectionText:
        'Před potvrzením a platbou jsou přímé kontakty skryté.',
      clientNote: 'Poznámky',
      paymentHint: 'Poté se otevře obrazovka platby zálohy.',
    };
  }

  if (language === 'DE') {
    return {
      masterNotFound: 'Spezialist nicht gefunden',
      selectedServicesNotFound: 'Ausgewählte Leistungen nicht gefunden',
      yourDetails: 'Deine Daten',
      yourDetailsSub: 'Fülle deine Kontaktdaten zur Buchungsbestätigung aus',
      selectedProcedures: 'Ausgewählte Behandlungen',
      totalDuration: 'Gesamtdauer',
      totalPrice: 'Gesamtpreis',
      firstName: 'Vorname',
      lastName: 'Nachname',
      phone: 'Telefon',
      email: 'Email',
      whatsapp: 'WhatsApp',
      telegram: 'Telegram',
      instagram: 'Instagram',
      note: 'Notiz für den Profi',
      notePlaceholder: 'Wünsche, Details zur Leistung oder wichtige Hinweise',
      nextStep: 'Nächster Schritt',
      holdDeposit: 'Anzahlung leisten',
      continue: 'Weiter',
      bookingInfo: 'Buchungsinfo',
      required: 'Pflichtfeld',
      optional: 'Optional',
      contactsProtected: 'Deine Kontakte sind durch Olamep geschützt',
      phoneCode: 'Code',
      registrationType: 'Buchungstyp',
      quickBooking: 'Schnellbuchung',
      quickBookingText:
        'Geeignet, wenn der Kunde keine vollständige Registrierung möchte. Kontakt nur über internen Chat.',
      fullBooking: 'Vollständige Registrierung',
      fullBookingText:
        'Nach beidseitiger Bestätigung sieht der Profi Telefon, WhatsApp, Email und weitere Kontakte.',
      quickBadge: 'Nur Chat',
      fullBadge: 'Alle Kontakte nach Bestätigung',
      protectionTitle: 'Kontaktschutz',
      protectionText:
        'Vor Bestätigung und Zahlung sind direkte Kontakte verborgen.',
      clientNote: 'Notizen',
      paymentHint: 'Danach öffnet sich die Zahlungsseite für die Anzahlung.',
    };
  }

  if (language === 'PL') {
    return {
      masterNotFound: 'Specjalista nie został znaleziony',
      selectedServicesNotFound: 'Nie znaleziono wybranych usług',
      yourDetails: 'Twoje dane',
      yourDetailsSub: 'Uzupełnij kontakty, aby potwierdzić rezerwację',
      selectedProcedures: 'Wybrane zabiegi',
      totalDuration: 'Łączny czas',
      totalPrice: 'Łączna cena',
      firstName: 'Imię',
      lastName: 'Nazwisko',
      phone: 'Telefon',
      email: 'Email',
      whatsapp: 'WhatsApp',
      telegram: 'Telegram',
      instagram: 'Instagram',
      note: 'Notatka dla specjalisty',
      notePlaceholder: 'Preferencje, szczegóły usługi lub ważne notatki',
      nextStep: 'Następny krok',
      holdDeposit: 'Wpłać depozyt',
      continue: 'Dalej',
      bookingInfo: 'Informacje o rezerwacji',
      required: 'Pole wymagane',
      optional: 'Opcjonalne',
      contactsProtected: 'Twoje kontakty są chronione przez Olamep',
      phoneCode: 'Kod',
      registrationType: 'Typ rezerwacji',
      quickBooking: 'Szybka rezerwacja',
      quickBookingText:
        'Dobre, jeśli klient nie chce pełnej rejestracji. Specjalista może pisać tylko w czacie aplikacji.',
      fullBooking: 'Pełna rejestracja',
      fullBookingText:
        'Po potwierdzeniu przez obie strony specjalista zobaczy telefon, WhatsApp, email i inne kontakty.',
      quickBadge: 'Tylko chat',
      fullBadge: 'Wszystkie kontakty po potwierdzeniu',
      protectionTitle: 'Ochrona kontaktów',
      protectionText:
        'Przed potwierdzeniem i płatnością bezpośrednie kontakty są ukryte.',
      clientNote: 'Notatki',
      paymentHint: 'Następnie otworzy się ekran płatności depozytu.',
    };
  }

  return {
    masterNotFound: 'Master not found',
    selectedServicesNotFound: 'Selected services not found',
    yourDetails: 'Your details',
    yourDetailsSub: 'Fill in your contacts to confirm the booking',
    selectedProcedures: 'Selected procedures',
    totalDuration: 'Total duration',
    totalPrice: 'Total price',
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
    bookingInfo: 'Booking info',
    required: 'Required field',
    optional: 'Optional',
    contactsProtected: 'Your contacts are protected by Olamep',
    phoneCode: 'Code',
    registrationType: 'Booking type',
    quickBooking: 'Quick booking',
    quickBookingText:
      'Best if the client does not want full registration. The provider can contact only through in-app chat.',
    fullBooking: 'Full registration',
    fullBookingText:
      'After mutual confirmation, the provider can see phone, WhatsApp, email and other contacts you entered.',
    quickBadge: 'Chat only',
    fullBadge: 'All contacts after confirmation',
    protectionTitle: 'Contact protection',
    protectionText:
      'Before confirmation and payment, direct contacts are hidden. This keeps the booking protected inside the platform.',
    clientNote: 'Notes',
    paymentHint: 'After this, the deposit payment screen will open.',
  };
}

function badgeStyle(kind: 'green' | 'blue' | 'pink' | 'orange' | 'yellow') {
  if (kind === 'green') return { background: '#eef9f1', color: '#2fa35a' };
  if (kind === 'blue') return { background: '#eef4ff', color: '#2f7cf6' };
  if (kind === 'pink') return { background: '#fff1f7', color: '#ff4fa0' };
  if (kind === 'yellow') return { background: '#fff7cf', color: '#b28a00' };
  return { background: '#fff5e8', color: '#d68612' };
}

function fieldLabel(label: string, helper?: string) {
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
          color: '#17130f',
        }}
      >
        {label}
      </span>

      {helper ? (
        <span
          style={{
            fontSize: 12,
            fontWeight: 800,
            color: '#8b8075',
          }}
        >
          {helper}
        </span>
      ) : null}
    </div>
  );
}

function inputStyle() {
  return {
    width: '100%',
    height: 56,
    padding: '0 16px',
    borderRadius: 18,
    border: '1.5px solid #ddd2c4',
    fontSize: 16,
    outline: 'none',
    background: '#fff',
    boxSizing: 'border-box' as const,
    color: '#17130f',
    fontWeight: 700,
  };
}

export default function BookingDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [language, setLanguage] = useState<AppLanguage>(getSavedLanguage());

  const text = useMemo(() => getTexts(language), [language]);
  const master = useMemo(() => getMasterById(String(params.id)), [params.id]);

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
    setLanguage(getSavedLanguage());

    const unsubLanguage = subscribeToLanguageChange((nextLanguage) => {
      setLanguage(nextLanguage);
    });

    return () => {
      unsubLanguage();
    };
  }, []);

  if (!master) {
    return <main style={{ padding: 24 }}>{text.masterNotFound}</main>;
  }

  const selectedServiceSlugs = servicesParam
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  const selectedItems = master.services.filter((service) =>
    selectedServiceSlugs.includes(service.slug)
  );

  if (!selectedItems.length) {
    return <main style={{ padding: 24 }}>{text.selectedServicesNotFound}</main>;
  }

  const totalPrice = selectedItems.reduce((sum, item) => sum + item.price, 0);
  const totalMinutes = selectedItems.reduce(
    (sum, item) => sum + parseDurationToMinutes(item.duration),
    0
  );

  const quickValid =
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    phone.trim().length > 0;

  const fullValid =
    quickValid &&
    email.trim().length > 0 &&
    (whatsapp.trim().length > 0 ||
      telegram.trim().length > 0 ||
      instagram.trim().length > 0);

  const isValid = registrationMode === 'quick' ? quickValid : fullValid;

  const safePhone = `${countryCode} ${phone}`.trim();
  const safeWhatsapp = whatsapp.trim() || safePhone;

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#fbf7ef',
        fontFamily: 'Arial, sans-serif',
        color: '#17130f',
        paddingBottom: 126,
      }}
    >
      <div style={{ maxWidth: 430, margin: '0 auto', padding: 20 }}>
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
              border: '1.5px solid #e7ddd0',
              background: '#fff',
              fontSize: 24,
              cursor: 'pointer',
              boxShadow: '0 10px 22px rgba(44, 23, 10, 0.05)',
            }}
          >
            ←
          </button>

          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                fontSize: 28,
                fontWeight: 900,
                color: '#17130f',
                lineHeight: 1.05,
              }}
            >
              {text.yourDetails}
            </div>

            <div
              style={{
                marginTop: 8,
                fontSize: 14,
                color: '#7a7066',
                fontWeight: 700,
                lineHeight: 1.5,
              }}
            >
              {text.yourDetailsSub}
            </div>
          </div>

          <button
            type="button"
            onClick={() => router.push('/')}
            style={{
              width: 54,
              height: 54,
              borderRadius: 999,
              border: '1.5px solid #e7ddd0',
              background: '#fff',
              fontSize: 22,
              cursor: 'pointer',
              boxShadow: '0 10px 22px rgba(44, 23, 10, 0.05)',
            }}
          >
            ⌂
          </button>
        </div>

        <section
          style={{
            marginTop: 18,
            borderRadius: 30,
            border: '1.5px solid #f0e3d7',
            background: 'linear-gradient(180deg, #ffffff 0%, #fff8f8 100%)',
            padding: 18,
            boxShadow: '0 12px 28px rgba(44, 23, 10, 0.05)',
          }}
        >
          <div
            style={{
              fontSize: 20,
              fontWeight: 900,
              color: '#17130f',
              marginBottom: 12,
            }}
          >
            {text.bookingInfo}
          </div>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 10,
              marginBottom: 14,
            }}
          >
            <span
              style={{
                ...badgeStyle('blue'),
                borderRadius: 999,
                padding: '10px 14px',
                fontSize: 12,
                fontWeight: 900,
              }}
            >
              📅 {date}
            </span>

            <span
              style={{
                ...badgeStyle('orange'),
                borderRadius: 999,
                padding: '10px 14px',
                fontSize: 12,
                fontWeight: 900,
              }}
            >
              🕒 {time}
            </span>

            <span
              style={{
                ...badgeStyle('green'),
                borderRadius: 999,
                padding: '10px 14px',
                fontSize: 12,
                fontWeight: 900,
              }}
            >
              🔒 {text.contactsProtected}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {selectedItems.map((item) => (
              <div
                key={item.slug}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '64px 1fr auto',
                  gap: 12,
                  alignItems: 'center',
                  padding: 10,
                  borderRadius: 20,
                  background: '#fcfaf6',
                  border: '1.5px solid #f1e8dc',
                }}
              >
                <img
                  src={item.image}
                  alt={item.title}
                  style={{
                    width: 64,
                    height: 64,
                    objectFit: 'cover',
                    borderRadius: 16,
                    display: 'block',
                  }}
                />

                <div>
                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: 900,
                      color: '#17130f',
                    }}
                  >
                    {item.title}
                  </div>

                  <div
                    style={{
                      marginTop: 4,
                      color: '#746b62',
                      fontSize: 14,
                      fontWeight: 700,
                    }}
                  >
                    {item.duration}
                  </div>
                </div>

                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 900,
                    color: '#ff3b3b',
                  }}
                >
                  {formatDisplayPrice(item.price)}
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              marginTop: 14,
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 12,
            }}
          >
            <div
              style={{
                background: '#f7f1e8',
                borderRadius: 20,
                padding: 14,
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  color: '#6c645c',
                  fontWeight: 800,
                }}
              >
                {text.totalDuration}
              </div>

              <div
                style={{
                  fontSize: 24,
                  fontWeight: 900,
                  marginTop: 6,
                  color: '#17130f',
                }}
              >
                {formatMinutes(totalMinutes, language)}
              </div>
            </div>

            <div
              style={{
                background: '#f7f1e8',
                borderRadius: 20,
                padding: 14,
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  color: '#6c645c',
                  fontWeight: 800,
                }}
              >
                {text.totalPrice}
              </div>

              <div
                style={{
                  fontSize: 24,
                  fontWeight: 900,
                  marginTop: 6,
                  color: '#ff3b3b',
                }}
              >
                {formatDisplayPrice(totalPrice)}
              </div>
            </div>
          </div>
        </section>

        <section
          style={{
            marginTop: 16,
            borderRadius: 30,
            border: '1.5px solid #efe4d7',
            background: '#fff',
            padding: 18,
            boxShadow: '0 12px 28px rgba(44, 23, 10, 0.05)',
          }}
        >
          <div
            style={{
              fontSize: 20,
              fontWeight: 900,
              color: '#17130f',
              marginBottom: 12,
            }}
          >
            {text.registrationType}
          </div>

          <div style={{ display: 'grid', gap: 12 }}>
            {([
              {
                key: 'quick',
                title: text.quickBooking,
                body: text.quickBookingText,
                badge: text.quickBadge,
                color: '#fff7cf',
                border: '#f2c94c',
              },
              {
                key: 'full',
                title: text.fullBooking,
                body: text.fullBookingText,
                badge: text.fullBadge,
                color: '#eef9f1',
                border: '#2fa35a',
              },
            ] as const).map((item) => {
              const active = registrationMode === item.key;

              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setRegistrationMode(item.key)}
                  style={{
                    width: '100%',
                    borderRadius: 22,
                    border: active ? `2px solid ${item.border}` : '1.5px solid #e7ddd0',
                    background: active ? item.color : '#ffffff',
                    padding: 14,
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'grid',
                    gridTemplateColumns: '1fr 34px',
                    gap: 12,
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: 17,
                        fontWeight: 900,
                        color: '#17130f',
                      }}
                    >
                      {item.title}
                    </div>

                    <div
                      style={{
                        marginTop: 6,
                        fontSize: 13,
                        lineHeight: 1.45,
                        fontWeight: 700,
                        color: '#6f675f',
                      }}
                    >
                      {item.body}
                    </div>

                    <div
                      style={{
                        marginTop: 10,
                        display: 'inline-flex',
                        borderRadius: 999,
                        padding: '7px 10px',
                        background: '#ffffff',
                        color: item.border,
                        fontSize: 11,
                        fontWeight: 900,
                        border: `1.5px solid ${item.border}`,
                      }}
                    >
                      {item.badge}
                    </div>
                  </div>

                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 999,
                      border: active ? `2px solid ${item.border}` : '2px solid #d8cdc0',
                      background: active ? item.border : '#ffffff',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 18,
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
            marginTop: 16,
            borderRadius: 30,
            border: '1.5px solid #efe4d7',
            background: '#fff',
            padding: 18,
            boxShadow: '0 12px 28px rgba(44, 23, 10, 0.05)',
          }}
        >
          <div style={{ display: 'grid', gap: 16 }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 12,
              }}
            >
              <label style={{ display: 'block' }}>
                {fieldLabel(text.firstName, text.required)}
                <input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder={text.firstName}
                  style={inputStyle()}
                />
              </label>

              <label style={{ display: 'block' }}>
                {fieldLabel(text.lastName, text.required)}
                <input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder={text.lastName}
                  style={inputStyle()}
                />
              </label>
            </div>

            <label style={{ display: 'block' }}>
              {fieldLabel(text.phone, text.required)}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '118px 1fr',
                  gap: 10,
                }}
              >
                <div
                  style={{
                    height: 56,
                    borderRadius: 18,
                    border: '1.5px solid #ddd2c4',
                    background: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    fontWeight: 900,
                    color: '#17130f',
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
                  {fieldLabel(text.email, text.required)}
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={text.email}
                    inputMode="email"
                    style={inputStyle()}
                  />
                </label>

                <label style={{ display: 'block' }}>
                  {fieldLabel(text.whatsapp, text.optional)}
                  <input
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="+44..."
                    inputMode="tel"
                    style={inputStyle()}
                  />
                </label>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 12,
                  }}
                >
                  <label style={{ display: 'block' }}>
                    {fieldLabel(text.telegram, text.optional)}
                    <input
                      value={telegram}
                      onChange={(e) => setTelegram(e.target.value)}
                      placeholder="@username"
                      style={inputStyle()}
                    />
                  </label>

                  <label style={{ display: 'block' }}>
                    {fieldLabel(text.instagram, text.optional)}
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
              {fieldLabel(text.note, text.optional)}
              <textarea
                value={clientNote}
                onChange={(e) => setClientNote(e.target.value)}
                placeholder={text.notePlaceholder}
                rows={4}
                style={{
                  width: '100%',
                  borderRadius: 18,
                  border: '1.5px solid #ddd2c4',
                  padding: 14,
                  outline: 'none',
                  resize: 'none',
                  fontFamily: 'Arial, sans-serif',
                  fontSize: 15,
                  lineHeight: 1.4,
                  fontWeight: 700,
                  color: '#17130f',
                  boxSizing: 'border-box',
                }}
              />
            </label>
          </div>
        </section>

        <section
          style={{
            marginTop: 16,
            borderRadius: 26,
            border: '1.5px solid #f2c94c',
            background: '#fff7cf',
            padding: 16,
          }}
        >
          <div
            style={{
              fontSize: 18,
              fontWeight: 900,
              color: '#17130f',
            }}
          >
            🔒 {text.protectionTitle}
          </div>

          <div
            style={{
              marginTop: 8,
              fontSize: 13,
              fontWeight: 800,
              lineHeight: 1.45,
              color: '#6f675f',
            }}
          >
            {text.protectionText}
          </div>

          <div
            style={{
              marginTop: 10,
              fontSize: 13,
              fontWeight: 900,
              color: '#b28a00',
            }}
          >
            {text.paymentHint}
          </div>
        </section>
      </div>

      <div
        style={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(255,255,255,0.96)',
          backdropFilter: 'blur(10px)',
          borderTop: '1px solid #e6ddd1',
          padding: '14px 16px calc(14px + env(safe-area-inset-bottom))',
          zIndex: 50,
        }}
      >
        <div
          style={{
            maxWidth: 430,
            margin: '0 auto',
            display: 'flex',
            gap: 14,
            alignItems: 'center',
          }}
        >
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: 13,
                color: '#6c645c',
                fontWeight: 800,
              }}
            >
              {text.nextStep}
            </div>

            <div
              style={{
                fontSize: 27,
                fontWeight: 900,
                marginTop: 4,
                color: '#17130f',
                lineHeight: 1,
              }}
            >
              {text.holdDeposit}
            </div>
          </div>

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
              border: 'none',
              background: isValid
                ? 'linear-gradient(180deg, #2fa35a 0%, #238247 100%)'
                : '#b7d9bf',
              color: '#fff',
              borderRadius: 22,
              padding: '18px 24px',
              fontWeight: 900,
              fontSize: 16,
              cursor: isValid ? 'pointer' : 'not-allowed',
              boxShadow: isValid ? '0 12px 24px rgba(47,163,90,0.20)' : 'none',
              whiteSpace: 'nowrap',
            }}
          >
            {text.continue}
          </button>
        </div>
      </div>
    </main>
  );
}
