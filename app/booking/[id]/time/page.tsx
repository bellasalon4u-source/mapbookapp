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

function getTexts(language: AppLanguage) {
  if (language === 'RU') {
    return {
      bookingDataNotFound: 'Данные бронирования не найдены',
      chooseTime: 'Выберите время',
      selectedServices: 'Выбранные услуги',
      totalDuration: 'Общая длительность',
      totalPrice: 'Общая цена',
      availableTime: 'Доступное время',
      selectedDate: 'Выбранная дата',
      selected: 'Выбрано',
      notSelected: 'Не выбрано',
      continue: 'Продолжить',
      zeroMinutes: '0м',
    };
  }

  if (language === 'ES') {
    return {
      bookingDataNotFound: 'Datos de reserva no encontrados',
      chooseTime: 'Elige hora',
      selectedServices: 'Servicios seleccionados',
      totalDuration: 'Duración total',
      totalPrice: 'Precio total',
      availableTime: 'Hora disponible',
      selectedDate: 'Fecha seleccionada',
      selected: 'Seleccionado',
      notSelected: 'No seleccionado',
      continue: 'Continuar',
      zeroMinutes: '0 min',
    };
  }

  if (language === 'CZ') {
    return {
      bookingDataNotFound: 'Údaje rezervace nebyly nalezeny',
      chooseTime: 'Vyberte čas',
      selectedServices: 'Vybrané služby',
      totalDuration: 'Celková délka',
      totalPrice: 'Celková cena',
      availableTime: 'Dostupný čas',
      selectedDate: 'Vybrané datum',
      selected: 'Vybráno',
      notSelected: 'Nevybráno',
      continue: 'Pokračovat',
      zeroMinutes: '0 min',
    };
  }

  if (language === 'DE') {
    return {
      bookingDataNotFound: 'Buchungsdaten nicht gefunden',
      chooseTime: 'Zeit wählen',
      selectedServices: 'Ausgewählte Leistungen',
      totalDuration: 'Gesamtdauer',
      totalPrice: 'Gesamtpreis',
      availableTime: 'Verfügbare Zeit',
      selectedDate: 'Ausgewähltes Datum',
      selected: 'Ausgewählt',
      notSelected: 'Nicht ausgewählt',
      continue: 'Weiter',
      zeroMinutes: '0 Min',
    };
  }

  if (language === 'PL') {
    return {
      bookingDataNotFound: 'Nie znaleziono danych rezerwacji',
      chooseTime: 'Wybierz godzinę',
      selectedServices: 'Wybrane usługi',
      totalDuration: 'Łączny czas',
      totalPrice: 'Łączna cena',
      availableTime: 'Dostępny czas',
      selectedDate: 'Wybrana data',
      selected: 'Wybrano',
      notSelected: 'Nie wybrano',
      continue: 'Dalej',
      zeroMinutes: '0 min',
    };
  }

  return {
    bookingDataNotFound: 'Booking data not found',
    chooseTime: 'Choose time',
    selectedServices: 'Selected services',
    totalDuration: 'Total duration',
    totalPrice: 'Total price',
    availableTime: 'Available time',
    selectedDate: 'Selected date',
    selected: 'Selected',
    notSelected: 'Not selected',
    continue: 'Continue',
    zeroMinutes: '0m',
  };
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

const timeSlots = ['09:00', '10:30', '11:20', '11:40', '12:40', '13:00', '14:00', '15:30', '16:00', '16:30'];

export default function BookingTimePage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [language, setLanguage] = useState<AppLanguage>(getSavedLanguage());

  const text = useMemo(() => getTexts(language), [language]);

  const master = useMemo(() => getMasterById(String(params.id)), [params.id]);
  const servicesParam = searchParams.get('services') || '';
  const date = searchParams.get('date') || '';

  const selectedServiceSlugs = servicesParam
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  const selectedItems = master
    ? master.services.filter((service) => selectedServiceSlugs.includes(service.slug))
    : [];

  const [selectedTime, setSelectedTime] = useState('');

  useEffect(() => {
    setLanguage(getSavedLanguage());

    const unsubLanguage = subscribeToLanguageChange((nextLanguage) => {
      setLanguage(nextLanguage);
    });

    return () => {
      unsubLanguage();
    };
  }, []);

  if (!master || !selectedItems.length || !date) {
    return <main style={{ padding: 24 }}>{text.bookingDataNotFound}</main>;
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

          <div style={{ fontSize: 30, fontWeight: 800 }}>{text.chooseTime}</div>

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
            padding: 16,
          }}
        >
          <div style={{ fontSize: 22, fontWeight: 800 }}>{text.selectedServices}</div>

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
        </div>

        <div
          style={{
            marginTop: 22,
            background: '#fff',
            border: '1px solid #e4d8ca',
            borderRadius: 26,
            padding: 18,
          }}
        >
          <div style={{ fontSize: 22, fontWeight: 800 }}>{text.availableTime}</div>

          <div style={{ marginTop: 10, color: '#6f655b', fontSize: 16 }}>
            {text.selectedDate}:{' '}
            <span style={{ fontWeight: 800, color: '#1d1712' }}>{date}</span>
          </div>

          <div
            style={{
              marginTop: 16,
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 12,
            }}
          >
            {timeSlots.map((slot) => {
              const active = selectedTime === slot;

              return (
                <button
                  key={slot}
                  onClick={() => setSelectedTime(slot)}
                  style={{
                    borderRadius: 20,
                    padding: '18px 12px',
                    fontSize: 18,
                    fontWeight: 800,
                    border: active ? '2px solid #16a34a' : '1px solid #ddd2c4',
                    background: active ? '#dcfce7' : '#fff',
                    color: active ? '#15803d' : '#1d1712',
                    cursor: 'pointer',
                  }}
                >
                  {slot}
                </button>
              );
            })}
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
              {text.selected}
            </div>
            <div style={{ fontSize: 22, fontWeight: 900, marginTop: 6 }}>
              {selectedTime ? `${date} • ${selectedTime}` : text.notSelected}
            </div>
          </div>

          <button
            disabled={!selectedTime}
            onClick={() => {
              if (!selectedTime) return;

              const servicesEncoded = encodeURIComponent(selectedServiceSlugs.join(','));
              router.push(
                `/booking/${master.id}/details?services=${servicesEncoded}&date=${encodeURIComponent(
                  date
                )}&time=${encodeURIComponent(selectedTime)}`
              );
            }}
            style={{
              border: 'none',
              background: selectedTime ? '#16a34a' : '#b7d9bf',
              color: '#fff',
              borderRadius: 24,
              padding: '18px 26px',
              fontWeight: 800,
              fontSize: 18,
              cursor: selectedTime ? 'pointer' : 'not-allowed',
            }}
          >
            {text.continue}
          </button>
        </div>
      </div>
    </main>
  );
}
