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
      bookingNotFound: 'Бронирование не найдено',
      selectedProceduresNotFound: 'Выбранные процедуры не найдены',
      bookingSent: 'Бронирование отправлено',
      bookingSentText1: 'Ваш депозит £5 готов.',
      bookingSentText2: 'Теперь специалист может просмотреть и подтвердить вашу запись.',
      selectedProcedures: 'Выбранные процедуры',
      totalDuration: 'Общая длительность',
      totalPrice: 'Общая цена',
      address: 'Адрес',
      phone: 'Телефон',
      email: 'Email',
      social: 'Соцсеть',
      writeToSeller: 'Написать специалисту',
      callSeller: 'Позвонить специалисту',
      goHome: 'На главную',
      emptyValue: '—',
    };
  }

  if (language === 'ES') {
    return {
      bookingNotFound: 'Reserva no encontrada',
      selectedProceduresNotFound: 'Procedimientos seleccionados no encontrados',
      bookingSent: 'Reserva enviada',
      bookingSentText1: 'Tu depósito de £5 está listo.',
      bookingSentText2: 'Ahora el profesional puede revisar y confirmar tu cita.',
      selectedProcedures: 'Procedimientos seleccionados',
      totalDuration: 'Duración total',
      totalPrice: 'Precio total',
      address: 'Dirección',
      phone: 'Teléfono',
      email: 'Email',
      social: 'Red social',
      writeToSeller: 'Escribir al profesional',
      callSeller: 'Llamar al profesional',
      goHome: 'Ir al inicio',
      emptyValue: '—',
    };
  }

  if (language === 'CZ') {
    return {
      bookingNotFound: 'Rezervace nebyla nalezena',
      selectedProceduresNotFound: 'Vybrané procedury nebyly nalezeny',
      bookingSent: 'Rezervace odeslána',
      bookingSentText1: 'Vaše záloha £5 je připravena.',
      bookingSentText2: 'Specialista nyní může vaši rezervaci zkontrolovat a potvrdit.',
      selectedProcedures: 'Vybrané procedury',
      totalDuration: 'Celková délka',
      totalPrice: 'Celková cena',
      address: 'Adresa',
      phone: 'Telefon',
      email: 'Email',
      social: 'Sociální síť',
      writeToSeller: 'Napsat specialistovi',
      callSeller: 'Zavolat specialistovi',
      goHome: 'Na hlavní stránku',
      emptyValue: '—',
    };
  }

  if (language === 'DE') {
    return {
      bookingNotFound: 'Buchung nicht gefunden',
      selectedProceduresNotFound: 'Ausgewählte Behandlungen nicht gefunden',
      bookingSent: 'Buchung gesendet',
      bookingSentText1: 'Deine £5 Anzahlung ist bereit.',
      bookingSentText2: 'Jetzt kann der Anbieter deinen Termin prüfen und bestätigen.',
      selectedProcedures: 'Ausgewählte Behandlungen',
      totalDuration: 'Gesamtdauer',
      totalPrice: 'Gesamtpreis',
      address: 'Adresse',
      phone: 'Telefon',
      email: 'Email',
      social: 'Soziales Netzwerk',
      writeToSeller: 'Dem Anbieter schreiben',
      callSeller: 'Anbieter anrufen',
      goHome: 'Zur Startseite',
      emptyValue: '—',
    };
  }

  if (language === 'PL') {
    return {
      bookingNotFound: 'Nie znaleziono rezerwacji',
      selectedProceduresNotFound: 'Nie znaleziono wybranych zabiegów',
      bookingSent: 'Rezerwacja wysłana',
      bookingSentText1: 'Twój depozyt £5 jest gotowy.',
      bookingSentText2: 'Teraz specjalista może sprawdzić i potwierdzić Twoją wizytę.',
      selectedProcedures: 'Wybrane zabiegi',
      totalDuration: 'Łączny czas',
      totalPrice: 'Łączna cena',
      address: 'Adres',
      phone: 'Telefon',
      email: 'Email',
      social: 'Social media',
      writeToSeller: 'Napisz do specjalisty',
      callSeller: 'Zadzwoń do specjalisty',
      goHome: 'Strona główna',
      emptyValue: '—',
    };
  }

  return {
    bookingNotFound: 'Booking not found',
    selectedProceduresNotFound: 'Selected procedures not found',
    bookingSent: 'Booking sent',
    bookingSentText1: 'Your £5 hold deposit is ready.',
    bookingSentText2: 'The seller can now review and confirm your appointment.',
    selectedProcedures: 'Selected procedures',
    totalDuration: 'Total duration',
    totalPrice: 'Total price',
    address: 'Address',
    phone: 'Phone',
    email: 'Email',
    social: 'Social',
    writeToSeller: 'Write to seller',
    callSeller: 'Call seller',
    goHome: 'Go home',
    emptyValue: '—',
  };
}

export default function BookingConfirmedPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [language, setLanguage] = useState<AppLanguage>(getSavedLanguage());

  const text = useMemo(() => getTexts(language), [language]);
  const master = useMemo(() => getMasterById(String(params.id)), [params.id]);

  const servicesParam = searchParams.get('services') || '';
  const date = searchParams.get('date') || '';
  const time = searchParams.get('time') || '';

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
    return <main style={{ padding: 24 }}>{text.bookingNotFound}</main>;
  }

  const selectedServiceSlugs = servicesParam
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  const selectedItems = master.services.filter((service) =>
    selectedServiceSlugs.includes(service.slug)
  );

  if (!selectedItems.length) {
    return <main style={{ padding: 24 }}>{text.selectedProceduresNotFound}</main>;
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
        padding: 24,
      }}
    >
      <div style={{ maxWidth: 420, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <div
            style={{
              width: 110,
              height: 110,
              borderRadius: 999,
              background: '#2e9746',
              color: '#fff',
              margin: '0 auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 64,
              fontWeight: 900,
            }}
          >
            ✓
          </div>

          <h1 style={{ fontSize: 38, marginTop: 24, marginBottom: 0 }}>
            {text.bookingSent}
          </h1>

          <p style={{ color: '#6f655b', fontSize: 18, marginTop: 14, lineHeight: 1.5 }}>
            {text.bookingSentText1}
            <br />
            {text.bookingSentText2}
          </p>
        </div>

        <div
          style={{
            marginTop: 28,
            background: '#fff',
            border: '1px solid #e4d8ca',
            borderRadius: 26,
            padding: 18,
          }}
        >
          <div style={{ fontSize: 24, fontWeight: 800 }}>{text.selectedProcedures}</div>

          <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {selectedItems.map((item) => (
              <div
                key={item.slug}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '72px 1fr',
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
                    width: 72,
                    height: 72,
                    objectFit: 'cover',
                    borderRadius: 16,
                  }}
                />

                <div>
                  <div style={{ fontSize: 19, fontWeight: 800 }}>{item.title}</div>
                  <div style={{ marginTop: 6, color: '#6e655d' }}>{item.duration}</div>
                  <div style={{ marginTop: 6, fontWeight: 800 }}>
                    {formatDisplayPrice(item.price)}
                  </div>
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

          <div style={{ marginTop: 16, color: '#2e9746', fontWeight: 800, fontSize: 18 }}>
            📅 {date}
          </div>
          <div style={{ marginTop: 8, color: '#2e9746', fontWeight: 800, fontSize: 18 }}>
            🕒 {time}
          </div>
        </div>

        <div
          style={{
            marginTop: 20,
            background: '#fff',
            border: '1px solid #e4d8ca',
            borderRadius: 26,
            padding: 18,
          }}
        >
          <div style={{ fontSize: 22, fontWeight: 800 }}>{master.name}</div>
          <div style={{ marginTop: 10, color: '#6e655d', lineHeight: 1.7 }}>
            {text.address}: {master.address || text.emptyValue}
            <br />
            {text.phone}: {master.phone || text.emptyValue}
            <br />
            {text.email}: {master.email || text.emptyValue}
            <br />
            {text.social}: {master.social || text.emptyValue}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 24 }}>
          <button
            style={{
              border: 'none',
              background: '#2e9746',
              color: '#fff',
              borderRadius: 22,
              padding: '18px 22px',
              fontWeight: 800,
              fontSize: 18,
              cursor: 'pointer',
            }}
          >
            {text.writeToSeller}
          </button>

          <button
            style={{
              border: 'none',
              background: '#dbeedc',
              color: '#24693b',
              borderRadius: 22,
              padding: '18px 22px',
              fontWeight: 800,
              fontSize: 18,
              cursor: 'pointer',
            }}
          >
            {text.callSeller}
          </button>

          <button
            onClick={() => router.push('/')}
            style={{
              border: '1px solid #d9d0c4',
              background: '#fff',
              color: '#2b231d',
              borderRadius: 22,
              padding: '18px 22px',
              fontWeight: 800,
              fontSize: 18,
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
