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
    };
  }

  if (language === 'ES') {
    return {
      masterNotFound: 'Profesional no encontrado',
      selectedServicesNotFound: 'Servicios seleccionados no encontrados',
      yourDetails: 'Tus datos',
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
    };
  }

  if (language === 'CZ') {
    return {
      masterNotFound: 'Specialista nebyl nalezen',
      selectedServicesNotFound: 'Vybrané služby nebyly nalezeny',
      yourDetails: 'Vaše údaje',
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
    };
  }

  if (language === 'DE') {
    return {
      masterNotFound: 'Spezialist nicht gefunden',
      selectedServicesNotFound: 'Ausgewählte Leistungen nicht gefunden',
      yourDetails: 'Deine Daten',
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
    };
  }

  if (language === 'PL') {
    return {
      masterNotFound: 'Specjalista nie został znaleziony',
      selectedServicesNotFound: 'Nie znaleziono wybranych usług',
      yourDetails: 'Twoje dane',
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
    };
  }

  return {
    masterNotFound: 'Master not found',
    selectedServicesNotFound: 'Selected services not found',
    yourDetails: 'Your details',
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

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
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
        background: '#fcf8f2',
        fontFamily: 'Arial, sans-serif',
        color: '#1d1712',
        paddingBottom: 120,
      }}
    >
      <div style={{ maxWidth: 420, margin: '0 auto', padding: 24 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 22,
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
            }}
          >
            ←
          </button>

          <div style={{ fontSize: 30, fontWeight: 800 }}>{text.yourDetails}</div>

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
            }}
          >
            ⌂
          </button>
        </div>

        <div
          style={{
            background: '#fff',
            border: '1px solid #e4d8ca',
            borderRadius: 26,
            padding: 18,
          }}
        >
          <div style={{ fontSize: 22, fontWeight: 800 }}>{text.selectedProcedures}</div>

          <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {selectedItems.map((item) => (
              <div
                key={item.slug}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '56px 1fr auto',
                  gap: 12,
                  alignItems: 'center',
                  padding: 10,
                  borderRadius: 18,
                  background: '#faf6ef',
                }}
              >
                <img
                  src={item.image}
                  alt={item.title}
                  style={{
                    width: 56,
                    height: 56,
                    objectFit: 'cover',
                    borderRadius: 14,
                  }}
                />

                <div>
                  <div style={{ fontSize: 17, fontWeight: 800 }}>{item.title}</div>
                  <div style={{ marginTop: 4, color: '#746b62', fontSize: 14 }}>
                    {item.duration}
                  </div>
                </div>

                <div style={{ fontSize: 16, fontWeight: 800 }}>
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
                borderRadius: 18,
                padding: 12,
              }}
            >
              <div style={{ fontSize: 14, color: '#6c645c', fontWeight: 700 }}>
                {text.totalDuration}
              </div>
              <div style={{ fontSize: 24, fontWeight: 900, marginTop: 6 }}>
                {formatMinutes(totalMinutes, language)}
              </div>
            </div>

            <div
              style={{
                background: '#f7f1e8',
                borderRadius: 18,
                padding: 12,
              }}
            >
              <div style={{ fontSize: 14, color: '#6c645c', fontWeight: 700 }}>
                {text.totalPrice}
              </div>
              <div style={{ fontSize: 24, fontWeight: 900, marginTop: 6 }}>
                {formatDisplayPrice(totalPrice)}
              </div>
            </div>
          </div>

          <div style={{ marginTop: 16, color: '#5f564d', fontWeight: 700 }}>
            {date} • {time}
          </div>
        </div>

        <div
          style={{
            marginTop: 18,
            background: '#fff',
            border: '1px solid #e4d8ca',
            borderRadius: 26,
            padding: 18,
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder={text.firstName}
              style={{
                width: '100%',
                padding: '18px 18px',
                borderRadius: 18,
                border: '1px solid #ddd2c4',
                fontSize: 18,
                outline: 'none',
                background: '#fff',
                boxSizing: 'border-box',
              }}
            />

            <input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder={text.lastName}
              style={{
                width: '100%',
                padding: '18px 18px',
                borderRadius: 18,
                border: '1px solid #ddd2c4',
                fontSize: 18,
                outline: 'none',
                background: '#fff',
                boxSizing: 'border-box',
              }}
            />

            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={text.phone}
              style={{
                width: '100%',
                padding: '18px 18px',
                borderRadius: 18,
                border: '1px solid #ddd2c4',
                fontSize: 18,
                outline: 'none',
                background: '#fff',
                boxSizing: 'border-box',
              }}
            />

            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={text.email}
              style={{
                width: '100%',
                padding: '18px 18px',
                borderRadius: 18,
                border: '1px solid #ddd2c4',
                fontSize: 18,
                outline: 'none',
                background: '#fff',
                boxSizing: 'border-box',
              }}
            />

            <input
              value={social}
              onChange={(e) => setSocial(e.target.value)}
              placeholder={text.social}
              style={{
                width: '100%',
                padding: '18px 18px',
                borderRadius: 18,
                border: '1px solid #ddd2c4',
                fontSize: 18,
                outline: 'none',
                background: '#fff',
                boxSizing: 'border-box',
              }}
            />
          </div>
        </div>
      </div>

      <div
        style={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          background: '#fff',
          borderTop: '1px solid #e6ddd1',
          padding: '14px 16px',
        }}
      >
        <div
          style={{
            maxWidth: 420,
            margin: '0 auto',
            display: 'flex',
            gap: 14,
            alignItems: 'center',
          }}
        >
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, color: '#6c645c', fontWeight: 700 }}>
              {text.nextStep}
            </div>
            <div style={{ fontSize: 28, fontWeight: 900, marginTop: 6 }}>
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
                )}&phone=${encodeURIComponent(phone)}&email=${encodeURIComponent(
                  email
                )}&social=${encodeURIComponent(social)}`
              );
            }}
            style={{
              border: 'none',
              background: isValid ? '#2e9746' : '#b7d9bf',
              color: '#fff',
              borderRadius: 24,
              padding: '18px 26px',
              fontWeight: 800,
              fontSize: 18,
              cursor: isValid ? 'pointer' : 'not-allowed',
            }}
          >
            {text.continue}
          </button>
        </div>
      </div>
    </main>
  );
}
