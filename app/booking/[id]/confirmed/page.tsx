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
      bookingSentText1: 'Ваш депозит £5 успешно удержан.',
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
      buildRoute: 'Проложить маршрут',
      bookingDetails: 'Детали бронирования',
      specialistContacts: 'Контакты специалиста',
      contactsVisible: 'Контакты открыты после оплаты',
      routeHint: 'Точный адрес доступен после успешной оплаты',
      emptyValue: '—',
      secured: 'Оплата подтверждена',
    };
  }

  if (language === 'ES') {
    return {
      bookingNotFound: 'Reserva no encontrada',
      selectedProceduresNotFound: 'Procedimientos seleccionados no encontrados',
      bookingSent: 'Reserva enviada',
      bookingSentText1: 'Tu depósito de £5 fue retenido correctamente.',
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
      buildRoute: 'Crear ruta',
      bookingDetails: 'Detalles de la reserva',
      specialistContacts: 'Contactos del profesional',
      contactsVisible: 'Los contactos están abiertos después del pago',
      routeHint: 'La dirección exacta está disponible después del pago exitoso',
      emptyValue: '—',
      secured: 'Pago confirmado',
    };
  }

  if (language === 'CZ') {
    return {
      bookingNotFound: 'Rezervace nebyla nalezena',
      selectedProceduresNotFound: 'Vybrané procedury nebyly nalezeny',
      bookingSent: 'Rezervace odeslána',
      bookingSentText1: 'Vaše záloha £5 byla úspěšně blokována.',
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
      buildRoute: 'Naplánovat trasu',
      bookingDetails: 'Detaily rezervace',
      specialistContacts: 'Kontakty specialisty',
      contactsVisible: 'Kontakty jsou dostupné po zaplacení',
      routeHint: 'Přesná adresa je dostupná po úspěšné platbě',
      emptyValue: '—',
      secured: 'Platba potvrzena',
    };
  }

  if (language === 'DE') {
    return {
      bookingNotFound: 'Buchung nicht gefunden',
      selectedProceduresNotFound: 'Ausgewählte Behandlungen nicht gefunden',
      bookingSent: 'Buchung gesendet',
      bookingSentText1: 'Deine £5 Anzahlung wurde erfolgreich reserviert.',
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
      buildRoute: 'Route planen',
      bookingDetails: 'Buchungsdetails',
      specialistContacts: 'Kontakte des Anbieters',
      contactsVisible: 'Kontakte sind nach der Zahlung sichtbar',
      routeHint: 'Die genaue Adresse ist nach erfolgreicher Zahlung verfügbar',
      emptyValue: '—',
      secured: 'Zahlung bestätigt',
    };
  }

  if (language === 'PL') {
    return {
      bookingNotFound: 'Nie znaleziono rezerwacji',
      selectedProceduresNotFound: 'Nie znaleziono wybranych zabiegów',
      bookingSent: 'Rezerwacja wysłana',
      bookingSentText1: 'Twój depozyt £5 został poprawnie zablokowany.',
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
      buildRoute: 'Wyznacz trasę',
      bookingDetails: 'Szczegóły rezerwacji',
      specialistContacts: 'Kontakty specjalisty',
      contactsVisible: 'Kontakty są dostępne po płatności',
      routeHint: 'Dokładny adres jest dostępny po udanej płatności',
      emptyValue: '—',
      secured: 'Płatność potwierdzona',
    };
  }

  return {
    bookingNotFound: 'Booking not found',
    selectedProceduresNotFound: 'Selected procedures not found',
    bookingSent: 'Booking sent',
    bookingSentText1: 'Your £5 hold deposit was secured successfully.',
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
    buildRoute: 'Build route',
    bookingDetails: 'Booking details',
    specialistContacts: 'Specialist contacts',
    contactsVisible: 'Contacts are visible after payment',
    routeHint: 'Exact address is available after successful payment',
    emptyValue: '—',
    secured: 'Payment confirmed',
  };
}

function badgeStyle(kind: 'green' | 'blue' | 'pink' | 'orange') {
  if (kind === 'green') return { background: '#eef9f1', color: '#2fa35a' };
  if (kind === 'blue') return { background: '#eef4ff', color: '#2f7cf6' };
  if (kind === 'pink') return { background: '#fff1f7', color: '#ff4fa0' };
  return { background: '#fff5e8', color: '#d68612' };
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

  const addressValue = master.address || text.emptyValue;
  const phoneValue = master.phone || text.emptyValue;
  const emailValue = master.email || text.emptyValue;
  const socialValue = master.social || text.emptyValue;

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#fbf7ef',
        padding: '20px 16px 40px',
        fontFamily: 'Arial, sans-serif',
        color: '#17130f',
      }}
    >
      <div style={{ maxWidth: 430, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginTop: 10 }}>
          <div
            style={{
              width: 112,
              height: 112,
              borderRadius: 999,
              background: 'linear-gradient(180deg, #2fa35a 0%, #238247 100%)',
              color: '#fff',
              margin: '0 auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 62,
              fontWeight: 900,
              boxShadow: '0 16px 30px rgba(47,163,90,0.22)',
            }}
          >
            ✓
          </div>

          <h1
            style={{
              fontSize: 36,
              lineHeight: 1.05,
              marginTop: 22,
              marginBottom: 0,
              fontWeight: 900,
              color: '#17130f',
            }}
          >
            {text.bookingSent}
          </h1>

          <p
            style={{
              color: '#6f655b',
              fontSize: 17,
              marginTop: 14,
              lineHeight: 1.6,
              fontWeight: 700,
            }}
          >
            {text.bookingSentText1}
            <br />
            {text.bookingSentText2}
          </p>

          <div
            style={{
              marginTop: 14,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              borderRadius: 999,
              padding: '10px 14px',
              ...badgeStyle('green'),
              fontSize: 13,
              fontWeight: 900,
            }}
          >
            <span>🛡️</span>
            <span>{text.secured}</span>
          </div>
        </div>

        <div
          style={{
            marginTop: 26,
            borderRadius: 30,
            border: '1px solid #efe4d7',
            background: '#fff',
            padding: 18,
            boxShadow: '0 12px 28px rgba(44, 23, 10, 0.05)',
          }}
        >
          <div
            style={{
              fontSize: 22,
              fontWeight: 900,
              color: '#17130f',
              marginBottom: 12,
            }}
          >
            {text.bookingDetails}
          </div>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 10,
              marginBottom: 14,
            }}
          >
            <div
              style={{
                ...badgeStyle('blue'),
                borderRadius: 999,
                padding: '10px 14px',
                fontSize: 13,
                fontWeight: 900,
              }}
            >
              📅 {date}
            </div>

            <div
              style={{
                ...badgeStyle('orange'),
                borderRadius: 999,
                padding: '10px 14px',
                fontSize: 13,
                fontWeight: 900,
              }}
            >
              🕒 {time}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {selectedItems.map((item) => (
              <div
                key={item.slug}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '72px 1fr',
                  gap: 12,
                  alignItems: 'center',
                  padding: 10,
                  borderRadius: 22,
                  background: '#fcfaf6',
                  border: '1px solid #f1e8dc',
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
                    display: 'block',
                  }}
                />

                <div>
                  <div style={{ fontSize: 18, fontWeight: 900, color: '#17130f' }}>
                    {item.title}
                  </div>
                  <div
                    style={{
                      marginTop: 6,
                      color: '#6e655d',
                      fontSize: 14,
                      fontWeight: 700,
                    }}
                  >
                    {item.duration}
                  </div>
                  <div
                    style={{
                      marginTop: 6,
                      fontWeight: 900,
                      fontSize: 16,
                      color: '#17130f',
                    }}
                  >
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
            marginTop: 18,
            borderRadius: 30,
            border: '1px solid #efe4d7',
            background: '#fff',
            padding: 18,
            boxShadow: '0 12px 28px rgba(44, 23, 10, 0.05)',
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
              src={
                master.avatar ||
                'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80'
              }
              alt={master.name}
              style={{
                width: 72,
                height: 72,
                borderRadius: 22,
                objectFit: 'cover',
                display: 'block',
                boxShadow: '0 10px 22px rgba(44, 23, 10, 0.10)',
              }}
            />

            <div>
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 900,
                  color: '#17130f',
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
                  ...badgeStyle('pink'),
                  fontSize: 12,
                  fontWeight: 900,
                }}
              >
                <span>📍</span>
                <span>{text.contactsVisible}</span>
              </div>
            </div>
          </div>

          <div
            style={{
              fontSize: 20,
              fontWeight: 900,
              color: '#17130f',
              marginBottom: 12,
            }}
          >
            {text.specialistContacts}
          </div>

          <div
            style={{
              display: 'grid',
              gap: 10,
            }}
          >
            {[
              { label: text.address, value: addressValue, icon: '📍' },
              { label: text.phone, value: phoneValue, icon: '📞' },
              { label: text.email, value: emailValue, icon: '✉️' },
              { label: text.social, value: socialValue, icon: '💬' },
            ].map((item, index) => (
              <div
                key={`${item.label}-${index}`}
                style={{
                  borderRadius: 20,
                  background: '#fcfaf6',
                  border: '1px solid #f1e8dc',
                  padding: '14px 14px',
                  display: 'grid',
                  gridTemplateColumns: '36px 1fr',
                  gap: 12,
                  alignItems: 'start',
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 12,
                    background: index === 0 ? '#fff5e8' : index === 1 ? '#eef9f1' : index === 2 ? '#eef4ff' : '#fff1f7',
                    color: index === 0 ? '#d68612' : index === 1 ? '#2fa35a' : index === 2 ? '#2f7cf6' : '#ff4fa0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 18,
                  }}
                >
                  {item.icon}
                </div>

                <div>
                  <div
                    style={{
                      fontSize: 12,
                      color: '#8b8075',
                      fontWeight: 800,
                    }}
                  >
                    {item.label}
                  </div>
                  <div
                    style={{
                      marginTop: 4,
                      fontSize: 15,
                      lineHeight: 1.5,
                      color: '#17130f',
                      fontWeight: 800,
                      wordBreak: 'break-word',
                    }}
                  >
                    {item.value}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              marginTop: 12,
              borderRadius: 18,
              background: '#eef4ff',
              padding: '12px 14px',
              fontSize: 13,
              color: '#2f5dc4',
              fontWeight: 800,
            }}
          >
            {text.routeHint}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            marginTop: 20,
          }}
        >
          <button
            type="button"
            style={{
              border: 'none',
              background: 'linear-gradient(180deg, #2fa35a 0%, #238247 100%)',
              color: '#fff',
              borderRadius: 22,
              padding: '18px 22px',
              fontWeight: 900,
              fontSize: 17,
              cursor: 'pointer',
              boxShadow: '0 12px 24px rgba(47,163,90,0.20)',
            }}
          >
            {text.writeToSeller}
          </button>

          <button
            type="button"
            style={{
              border: '1px solid #dce8ff',
              background: '#eef4ff',
              color: '#2f7cf6',
              borderRadius: 22,
              padding: '18px 22px',
              fontWeight: 900,
              fontSize: 17,
              cursor: 'pointer',
            }}
          >
            {text.buildRoute}
          </button>

          <button
            type="button"
            style={{
              border: '1px solid #d8eddc',
              background: '#eef9f1',
              color: '#24693b',
              borderRadius: 22,
              padding: '18px 22px',
              fontWeight: 900,
              fontSize: 17,
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
