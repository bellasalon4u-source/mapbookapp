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
      holdDeposit: 'Внести депозит',
      holdDepositAmount: 'Депозит £5',
      selectedProcedures: 'Выбранные процедуры',
      totalDuration: 'Общая длительность',
      totalPrice: 'Общая цена',
      holdInfoLine1: '£5 будут временно заморожены на вашей карте.',
      holdInfoLine2: 'Списание произойдет только после подтверждения записи специалистом.',
      date: 'Дата',
      time: 'Время',
      customer: 'Клиент',
      phone: 'Телефон',
      email: 'Email',
      social: 'Соцсеть',
      secureBookingFee: 'Безопасный сбор за бронь',
      holdDepositButton: 'Заморозить депозит £5',
      emptyValue: '—',
    };
  }

  if (language === 'ES') {
    return {
      masterNotFound: 'Profesional no encontrado',
      selectedServicesNotFound: 'Servicios seleccionados no encontrados',
      holdDeposit: 'Pagar depósito',
      holdDepositAmount: 'Depósito de £5',
      selectedProcedures: 'Procedimientos seleccionados',
      totalDuration: 'Duración total',
      totalPrice: 'Precio total',
      holdInfoLine1: '£5 se retendrán temporalmente en tu tarjeta.',
      holdInfoLine2: 'Solo se cobrará después de que el profesional confirme tu cita.',
      date: 'Fecha',
      time: 'Hora',
      customer: 'Cliente',
      phone: 'Teléfono',
      email: 'Email',
      social: 'Red social',
      secureBookingFee: 'Tarifa segura de reserva',
      holdDepositButton: 'Retener depósito de £5',
      emptyValue: '—',
    };
  }

  if (language === 'CZ') {
    return {
      masterNotFound: 'Specialista nebyl nalezen',
      selectedServicesNotFound: 'Vybrané služby nebyly nalezeny',
      holdDeposit: 'Zaplatit zálohu',
      holdDepositAmount: 'Záloha £5',
      selectedProcedures: 'Vybrané procedury',
      totalDuration: 'Celková délka',
      totalPrice: 'Celková cena',
      holdInfoLine1: '£5 bude dočasně zablokováno na vaší kartě.',
      holdInfoLine2: 'Stržení proběhne až po potvrzení rezervace specialistou.',
      date: 'Datum',
      time: 'Čas',
      customer: 'Klient',
      phone: 'Telefon',
      email: 'Email',
      social: 'Sociální síť',
      secureBookingFee: 'Bezpečný rezervační poplatek',
      holdDepositButton: 'Zablokovat zálohu £5',
      emptyValue: '—',
    };
  }

  if (language === 'DE') {
    return {
      masterNotFound: 'Spezialist nicht gefunden',
      selectedServicesNotFound: 'Ausgewählte Leistungen nicht gefunden',
      holdDeposit: 'Anzahlung leisten',
      holdDepositAmount: '£5 Anzahlung',
      selectedProcedures: 'Ausgewählte Behandlungen',
      totalDuration: 'Gesamtdauer',
      totalPrice: 'Gesamtpreis',
      holdInfoLine1: '£5 werden vorübergehend auf deiner Karte reserviert.',
      holdInfoLine2: 'Die Abbuchung erfolgt erst, nachdem der Anbieter deinen Termin bestätigt hat.',
      date: 'Datum',
      time: 'Uhrzeit',
      customer: 'Kunde',
      phone: 'Telefon',
      email: 'Email',
      social: 'Soziales Netzwerk',
      secureBookingFee: 'Sichere Buchungsgebühr',
      holdDepositButton: '£5 Anzahlung reservieren',
      emptyValue: '—',
    };
  }

  if (language === 'PL') {
    return {
      masterNotFound: 'Specjalista nie został znaleziony',
      selectedServicesNotFound: 'Nie znaleziono wybranych usług',
      holdDeposit: 'Wpłać depozyt',
      holdDepositAmount: 'Depozyt £5',
      selectedProcedures: 'Wybrane zabiegi',
      totalDuration: 'Łączny czas',
      totalPrice: 'Łączna cena',
      holdInfoLine1: '£5 zostanie tymczasowo zablokowane na Twojej karcie.',
      holdInfoLine2: 'Opłata zostanie pobrana dopiero po potwierdzeniu wizyty przez specjalistę.',
      date: 'Data',
      time: 'Godzina',
      customer: 'Klient',
      phone: 'Telefon',
      email: 'Email',
      social: 'Social media',
      secureBookingFee: 'Bezpieczna opłata rezerwacyjna',
      holdDepositButton: 'Zablokuj depozyt £5',
      emptyValue: '—',
    };
  }

  return {
    masterNotFound: 'Master not found',
    selectedServicesNotFound: 'Selected services not found',
    holdDeposit: 'Hold deposit',
    holdDepositAmount: '£5 hold deposit',
    selectedProcedures: 'Selected procedures',
    totalDuration: 'Total duration',
    totalPrice: 'Total price',
    holdInfoLine1: '£5 will be temporarily held on your card.',
    holdInfoLine2: 'You will only be charged after the seller confirms your appointment.',
    date: 'Date',
    time: 'Time',
    customer: 'Customer',
    phone: 'Phone',
    email: 'Email',
    social: 'Social',
    secureBookingFee: 'Secure booking fee',
    holdDepositButton: 'Hold £5 deposit',
    emptyValue: '—',
  };
}

export default function BookingPaymentPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [language, setLanguage] = useState<AppLanguage>(getSavedLanguage());

  const text = useMemo(() => getTexts(language), [language]);
  const master = useMemo(() => getMasterById(String(params.id)), [params.id]);

  const servicesParam = searchParams.get('services') || '';
  const date = searchParams.get('date') || '';
  const time = searchParams.get('time') || '';
  const firstName = searchParams.get('firstName') || '';
  const lastName = searchParams.get('lastName') || '';
  const phone = searchParams.get('phone') || '';
  const email = searchParams.get('email') || '';
  const social = searchParams.get('social') || '';

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

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#fcf8f2',
        fontFamily: 'Arial, sans-serif',
        color: '#1d1712',
        paddingBottom: 110,
      }}
    >
      <div style={{ maxWidth: 420, margin: '0 auto', padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 30, fontWeight: 800 }}>{text.holdDeposit}</div>
            <div style={{ marginTop: 8, color: '#7a7066' }}>{text.holdDepositAmount}</div>
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
            }}
          >
            ⌂
          </button>
        </div>

        <div
          style={{
            marginTop: 22,
            background: '#fff',
            border: '1px solid #e4d8ca',
            borderRadius: 28,
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

          <div
            style={{
              marginTop: 18,
              background: '#e0f2e3',
              color: '#1f6d35',
              borderRadius: 22,
              padding: 18,
              fontWeight: 700,
              lineHeight: 1.5,
            }}
          >
            {text.holdInfoLine1}
            <br />
            {text.holdInfoLine2}
          </div>

          <div
            style={{
              marginTop: 18,
              background: '#f8f4ee',
              color: '#5e554d',
              borderRadius: 22,
              padding: 18,
              lineHeight: 1.6,
            }}
          >
            {text.date}: {date}
            <br />
            {text.time}: {time}
            <br />
            {text.customer}: {firstName} {lastName}
            <br />
            {text.phone}: {phone}
            <br />
            {text.email}: {email || text.emptyValue}
            <br />
            {text.social}: {social || text.emptyValue}
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
        <div style={{ maxWidth: 420, margin: '0 auto', display: 'flex', gap: 14, alignItems: 'center' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, color: '#6c645c', fontWeight: 700 }}>
              {text.secureBookingFee}
            </div>
            <div style={{ fontSize: 30, fontWeight: 900, marginTop: 6 }}>
              {formatDisplayPrice(5)}
            </div>
          </div>
          <button
            onClick={() =>
              router.push(
                `/booking/${master.id}/confirmed?services=${encodeURIComponent(
                  selectedServiceSlugs.join(',')
                )}&date=${encodeURIComponent(date)}&time=${encodeURIComponent(
                  time
                )}&firstName=${encodeURIComponent(firstName)}&lastName=${encodeURIComponent(
                  lastName
                )}&phone=${encodeURIComponent(phone)}&email=${encodeURIComponent(
                  email
                )}&social=${encodeURIComponent(social)}`
              )
            }
            style={{
              border: 'none',
              background: '#2e9746',
              color: '#fff',
              borderRadius: 24,
              padding: '18px 26px',
              fontWeight: 800,
              fontSize: 18,
              cursor: 'pointer',
            }}
          >
            {text.holdDepositButton}
          </button>
        </div>
      </div>
    </main>
  );
}
