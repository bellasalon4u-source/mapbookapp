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
      social: 'Соцсеть / мессенджер',
      nextStep: 'Следующий шаг',
      holdDeposit: 'Внести депозит',
      continue: 'Продолжить',
      bookingInfo: 'Информация о бронировании',
      required: 'Обязательное поле',
      optional: 'Необязательно',
      contactsProtected: 'Контакты защищены системой MapBook',
      phoneCode: 'Код',
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
      social: 'Red social / mensajero',
      nextStep: 'Siguiente paso',
      holdDeposit: 'Pagar depósito',
      continue: 'Continuar',
      bookingInfo: 'Información de la reserva',
      required: 'Campo obligatorio',
      optional: 'Opcional',
      contactsProtected: 'Tus contactos están protegidos por MapBook',
      phoneCode: 'Código',
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
      social: 'Sociální síť / messenger',
      nextStep: 'Další krok',
      holdDeposit: 'Zaplatit zálohu',
      continue: 'Pokračovat',
      bookingInfo: 'Informace o rezervaci',
      required: 'Povinné pole',
      optional: 'Volitelné',
      contactsProtected: 'Vaše kontakty jsou chráněny systémem MapBook',
      phoneCode: 'Kód',
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
      social: 'Soziales Netzwerk / Messenger',
      nextStep: 'Nächster Schritt',
      holdDeposit: 'Anzahlung leisten',
      continue: 'Weiter',
      bookingInfo: 'Buchungsinfo',
      required: 'Pflichtfeld',
      optional: 'Optional',
      contactsProtected: 'Deine Kontakte sind durch MapBook geschützt',
      phoneCode: 'Code',
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
      social: 'Social media / komunikator',
      nextStep: 'Następny krok',
      holdDeposit: 'Wpłać depozyt',
      continue: 'Dalej',
      bookingInfo: 'Informacje o rezerwacji',
      required: 'Pole wymagane',
      optional: 'Opcjonalne',
      contactsProtected: 'Twoje kontakty są chronione przez MapBook',
      phoneCode: 'Kod',
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
    social: 'Social / messenger',
    nextStep: 'Next step',
    holdDeposit: 'Hold deposit',
    continue: 'Continue',
    bookingInfo: 'Booking info',
    required: 'Required field',
    optional: 'Optional',
    contactsProtected: 'Your contacts are protected by MapBook',
    phoneCode: 'Code',
  };
}

function badgeStyle(kind: 'green' | 'blue' | 'pink' | 'orange') {
  if (kind === 'green') return { background: '#eef9f1', color: '#2fa35a' };
  if (kind === 'blue') return { background: '#eef4ff', color: '#2f7cf6' };
  if (kind === 'pink') return { background: '#fff1f7', color: '#ff4fa0' };
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

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [countryCode, setCountryCode] = useState('+44');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [social, setSocial] = useState('');

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

  const isValid =
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    phone.trim().length > 0;

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#fbf7ef',
        fontFamily: 'Arial, sans-serif',
        color: '#17130f',
        paddingBottom: 120,
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
            onClick={() => router.back()}
            style={{
              width: 54,
              height: 54,
              borderRadius: 999,
              border: '1px solid #e7ddd0',
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
            onClick={() => router.push('/')}
            style={{
              width: 54,
              height: 54,
              borderRadius: 999,
              border: '1px solid #e7ddd0',
              background: '#fff',
              fontSize: 22,
              cursor: 'pointer',
              boxShadow: '0 10px 22px rgba(44, 23, 10, 0.05)',
            }}
          >
            ⌂
          </button>
        </div>

        <div
          style={{
            marginTop: 18,
            borderRadius: 30,
            border: '1px solid #f0e3d7',
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
              {text.contactsProtected}
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
                  border: '1px solid #f1e8dc',
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
                    color: '#17130f',
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
                  color: '#17130f',
                }}
              >
                {formatDisplayPrice(totalPrice)}
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: 16,
            borderRadius: 30,
            border: '1px solid #efe4d7',
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
                  style={{
                    width: '100%',
                    height: 56,
                    padding: '0 16px',
                    borderRadius: 18,
                    border: '1px solid #ddd2c4',
                    fontSize: 16,
                    outline: 'none',
                    background: '#fff',
                    boxSizing: 'border-box',
                    color: '#17130f',
                  }}
                />
              </label>

              <label style={{ display: 'block' }}>
                {fieldLabel(text.lastName, text.required)}
                <input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder={text.lastName}
                  style={{
                    width: '100%',
                    height: 56,
                    padding: '0 16px',
                    borderRadius: 18,
                    border: '1px solid #ddd2c4',
                    fontSize: 16,
                    outline: 'none',
                    background: '#fff',
                    boxSizing: 'border-box',
                    color: '#17130f',
                  }}
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
                    border: '1px solid #ddd2c4',
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
                  style={{
                    width: '100%',
                    height: 56,
                    padding: '0 16px',
                    borderRadius: 18,
                    border: '1px solid #ddd2c4',
                    fontSize: 16,
                    outline: 'none',
                    background: '#fff',
                    boxSizing: 'border-box',
                    color: '#17130f',
                  }}
                />
              </div>
            </label>

            <label style={{ display: 'block' }}>
              {fieldLabel(text.email, text.optional)}
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={text.email}
                style={{
                  width: '100%',
                  height: 56,
                  padding: '0 16px',
                  borderRadius: 18,
                  border: '1px solid #ddd2c4',
                  fontSize: 16,
                  outline: 'none',
                  background: '#fff',
                  boxSizing: 'border-box',
                  color: '#17130f',
                }}
              />
            </label>

            <label style={{ display: 'block' }}>
              {fieldLabel(text.social, text.optional)}
              <input
                value={social}
                onChange={(e) => setSocial(e.target.value)}
                placeholder={text.social}
                style={{
                  width: '100%',
                  height: 56,
                  padding: '0 16px',
                  borderRadius: 18,
                  border: '1px solid #ddd2c4',
                  fontSize: 16,
                  outline: 'none',
                  background: '#fff',
                  boxSizing: 'border-box',
                  color: '#17130f',
                }}
              />
            </label>
          </div>
        </div>
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
                fontSize: 28,
                fontWeight: 900,
                marginTop: 4,
                color: '#17130f',
              }}
            >
              {text.holdDeposit}
            </div>
          </div>

          <button
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
                )}&phone=${encodeURIComponent(
                  `${countryCode} ${phone}`.trim()
                )}&email=${encodeURIComponent(email)}&social=${encodeURIComponent(social)}`
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
              boxShadow: isValid
                ? '0 12px 24px rgba(47,163,90,0.20)'
                : 'none',
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
