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
      holdDeposit: 'Оплата депозита',
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
      choosePaymentMethod: 'Способ оплаты',
      protectedPayment: 'Безопасная оплата',
      protectedPaymentSub: 'Ваш депозит защищён системой MapBook',
      card: 'Банковская карта',
      paypal: 'PayPal',
      appleGoogle: 'Apple Pay / Google Pay',
      paymentReady: 'Готово к оплате',
      bookingSummary: 'Сводка бронирования',
      paymentWillUnlock: 'Контакты и точный адрес откроются после оплаты',
    };
  }

  if (language === 'ES') {
    return {
      masterNotFound: 'Profesional no encontrado',
      selectedServicesNotFound: 'Servicios seleccionados no encontrados',
      holdDeposit: 'Pago del depósito',
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
      choosePaymentMethod: 'Método de pago',
      protectedPayment: 'Pago seguro',
      protectedPaymentSub: 'Tu depósito está protegido por el sistema MapBook',
      card: 'Tarjeta bancaria',
      paypal: 'PayPal',
      appleGoogle: 'Apple Pay / Google Pay',
      paymentReady: 'Listo para pagar',
      bookingSummary: 'Resumen de la reserva',
      paymentWillUnlock: 'Los contactos y la dirección exacta se abrirán después del pago',
    };
  }

  if (language === 'CZ') {
    return {
      masterNotFound: 'Specialista nebyl nalezen',
      selectedServicesNotFound: 'Vybrané služby nebyly nalezeny',
      holdDeposit: 'Platba zálohy',
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
      choosePaymentMethod: 'Způsob platby',
      protectedPayment: 'Bezpečná platba',
      protectedPaymentSub: 'Vaše záloha je chráněna systémem MapBook',
      card: 'Platební karta',
      paypal: 'PayPal',
      appleGoogle: 'Apple Pay / Google Pay',
      paymentReady: 'Připraveno k platbě',
      bookingSummary: 'Souhrn rezervace',
      paymentWillUnlock: 'Kontakty a přesná adresa se otevřou po zaplacení',
    };
  }

  if (language === 'DE') {
    return {
      masterNotFound: 'Spezialist nicht gefunden',
      selectedServicesNotFound: 'Ausgewählte Leistungen nicht gefunden',
      holdDeposit: 'Anzahlungszahlung',
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
      choosePaymentMethod: 'Zahlungsmethode',
      protectedPayment: 'Sichere Zahlung',
      protectedPaymentSub: 'Deine Anzahlung ist durch das MapBook-System geschützt',
      card: 'Bankkarte',
      paypal: 'PayPal',
      appleGoogle: 'Apple Pay / Google Pay',
      paymentReady: 'Bereit zur Zahlung',
      bookingSummary: 'Buchungsübersicht',
      paymentWillUnlock: 'Kontakte und genaue Adresse werden nach der Zahlung geöffnet',
    };
  }

  if (language === 'PL') {
    return {
      masterNotFound: 'Specjalista nie został znaleziony',
      selectedServicesNotFound: 'Nie znaleziono wybranych usług',
      holdDeposit: 'Płatność depozytu',
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
      choosePaymentMethod: 'Metoda płatności',
      protectedPayment: 'Bezpieczna płatność',
      protectedPaymentSub: 'Twój depozyt jest chroniony przez system MapBook',
      card: 'Karta bankowa',
      paypal: 'PayPal',
      appleGoogle: 'Apple Pay / Google Pay',
      paymentReady: 'Gotowe do płatności',
      bookingSummary: 'Podsumowanie rezerwacji',
      paymentWillUnlock: 'Kontakty i dokładny adres otworzą się po płatności',
    };
  }

  return {
    masterNotFound: 'Master not found',
    selectedServicesNotFound: 'Selected services not found',
    holdDeposit: 'Deposit payment',
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
    choosePaymentMethod: 'Payment method',
    protectedPayment: 'Protected payment',
    protectedPaymentSub: 'Your deposit is protected by the MapBook system',
    card: 'Bank card',
    paypal: 'PayPal',
    appleGoogle: 'Apple Pay / Google Pay',
    paymentReady: 'Ready to pay',
    bookingSummary: 'Booking summary',
    paymentWillUnlock: 'Contacts and exact address will unlock after payment',
  };
}

function badgeStyle(kind: 'green' | 'blue' | 'pink' | 'orange') {
  if (kind === 'green') return { background: '#eef9f1', color: '#2fa35a' };
  if (kind === 'blue') return { background: '#eef4ff', color: '#2f7cf6' };
  if (kind === 'pink') return { background: '#fff1f7', color: '#ff4fa0' };
  return { background: '#fff5e8', color: '#d68612' };
}

type PaymentMethod = 'card' | 'paypal' | 'wallet';

export default function BookingPaymentPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [language, setLanguage] = useState<AppLanguage>(getSavedLanguage());
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('card');

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
              {text.holdDeposit}
            </div>
            <div
              style={{
                marginTop: 8,
                fontSize: 15,
                color: '#7a7066',
                fontWeight: 700,
              }}
            >
              {text.holdDepositAmount}
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
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              marginBottom: 12,
            }}
          >
            <div
              style={{
                width: 54,
                height: 54,
                borderRadius: 18,
                background: '#eef9f1',
                color: '#2fa35a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 26,
              }}
            >
              🛡️
            </div>

            <div>
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 900,
                  color: '#17130f',
                }}
              >
                {text.protectedPayment}
              </div>
              <div
                style={{
                  marginTop: 4,
                  fontSize: 14,
                  lineHeight: 1.5,
                  color: '#7b7268',
                  fontWeight: 700,
                }}
              >
                {text.protectedPaymentSub}
              </div>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 10,
            }}
          >
            <span
              style={{
                ...badgeStyle('green'),
                borderRadius: 999,
                padding: '10px 14px',
                fontSize: 12,
                fontWeight: 900,
              }}
            >
              {text.paymentReady}
            </span>

            <span
              style={{
                ...badgeStyle('blue'),
                borderRadius: 999,
                padding: '10px 14px',
                fontSize: 12,
                fontWeight: 900,
              }}
            >
              {text.paymentWillUnlock}
            </span>
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
          <div
            style={{
              fontSize: 20,
              fontWeight: 900,
              color: '#17130f',
              marginBottom: 12,
            }}
          >
            {text.choosePaymentMethod}
          </div>

          <div style={{ display: 'grid', gap: 10 }}>
            {[
              { id: 'card' as PaymentMethod, icon: '💳', title: text.card, color: 'pink' as const },
              { id: 'paypal' as PaymentMethod, icon: '🅿️', title: text.paypal, color: 'blue' as const },
              { id: 'wallet' as PaymentMethod, icon: '📱', title: text.appleGoogle, color: 'green' as const },
            ].map((method) => {
              const active = selectedMethod === method.id;
              return (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => setSelectedMethod(method.id)}
                  style={{
                    width: '100%',
                    borderRadius: 22,
                    border: active ? '2px solid #ff4fa0' : '1px solid #efe4d7',
                    background: active ? '#fff8fb' : '#fcfaf6',
                    padding: 14,
                    display: 'grid',
                    gridTemplateColumns: '46px 1fr auto',
                    gap: 12,
                    alignItems: 'center',
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                >
                  <div
                    style={{
                      width: 46,
                      height: 46,
                      borderRadius: 16,
                      ...badgeStyle(method.color),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 22,
                    }}
                  >
                    {method.icon}
                  </div>

                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: 900,
                      color: '#17130f',
                    }}
                  >
                    {method.title}
                  </div>

                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 999,
                      border: active ? '7px solid #ff4fa0' : '2px solid #d8d0c5',
                      background: '#fff',
                      boxSizing: 'border-box',
                    }}
                  />
                </button>
              );
            })}
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
          <div
            style={{
              fontSize: 20,
              fontWeight: 900,
              color: '#17130f',
              marginBottom: 12,
            }}
          >
            {text.selectedProcedures}
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
          <div
            style={{
              fontSize: 20,
              fontWeight: 900,
              color: '#17130f',
              marginBottom: 12,
            }}
          >
            {text.bookingSummary}
          </div>

          <div
            style={{
              borderRadius: 22,
              background: '#eef9f1',
              color: '#1f6d35',
              padding: 16,
              fontWeight: 800,
              lineHeight: 1.55,
              fontSize: 14,
            }}
          >
            {text.holdInfoLine1}
            <br />
            {text.holdInfoLine2}
          </div>

          <div
            style={{
              marginTop: 14,
              borderRadius: 22,
              background: '#fcfaf6',
              border: '1px solid #f1e8dc',
              padding: 16,
              color: '#5e554d',
              lineHeight: 1.7,
              fontSize: 14,
              fontWeight: 700,
            }}
          >
            <div>
              {text.date}: <span style={{ color: '#17130f', fontWeight: 900 }}>{date}</span>
            </div>
            <div>
              {text.time}: <span style={{ color: '#17130f', fontWeight: 900 }}>{time}</span>
            </div>
            <div>
              {text.customer}:{' '}
              <span style={{ color: '#17130f', fontWeight: 900 }}>
                {firstName} {lastName}
              </span>
            </div>
            <div>
              {text.phone}: <span style={{ color: '#17130f', fontWeight: 900 }}>{phone}</span>
            </div>
            <div>
              {text.email}:{' '}
              <span style={{ color: '#17130f', fontWeight: 900 }}>
                {email || text.emptyValue}
              </span>
            </div>
            <div>
              {text.social}:{' '}
              <span style={{ color: '#17130f', fontWeight: 900 }}>
                {social || text.emptyValue}
              </span>
            </div>
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
              {text.secureBookingFee}
            </div>
            <div
              style={{
                fontSize: 30,
                fontWeight: 900,
                marginTop: 4,
                color: '#17130f',
              }}
            >
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
              background: 'linear-gradient(180deg, #2fa35a 0%, #238247 100%)',
              color: '#fff',
              borderRadius: 22,
              padding: '18px 24px',
              fontWeight: 900,
              fontSize: 16,
              cursor: 'pointer',
              boxShadow: '0 12px 24px rgba(47,163,90,0.20)',
              whiteSpace: 'nowrap',
            }}
          >
            {text.holdDepositButton}
          </button>
        </div>
      </div>
    </main>
  );
}
