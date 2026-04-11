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

type DateStatus = 'free' | 'full';

function getTexts(language: AppLanguage) {
  if (language === 'RU') {
    return {
      bookingDataNotFound: 'Данные бронирования не найдены',
      chooseDate: 'Выберите дату',
      selectedServices: 'Выбранные услуги',
      totalDuration: 'Общая длительность',
      totalPrice: 'Общая цена',
      today: 'Сегодня',
      chooseYear: 'Выберите год',
      chooseMonth: 'Выберите месяц',
      available: 'Доступно',
      unavailable: 'Недоступно',
      todayLabel: 'Сегодня',
      selectedDate: 'Выбранная дата',
      notSelected: 'Не выбрано',
      chooseTime: 'Выбрать время',
      from: 'от',
      zeroMinutes: '0м',
      monthsFull: [
        'Январь',
        'Февраль',
        'Март',
        'Апрель',
        'Май',
        'Июнь',
        'Июль',
        'Август',
        'Сентябрь',
        'Октябрь',
        'Ноябрь',
        'Декабрь',
      ],
      monthsShort: ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'],
      weekdaysShort: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
    };
  }

  if (language === 'ES') {
    return {
      bookingDataNotFound: 'Datos de reserva no encontrados',
      chooseDate: 'Elige fecha',
      selectedServices: 'Servicios seleccionados',
      totalDuration: 'Duración total',
      totalPrice: 'Precio total',
      today: 'Hoy',
      chooseYear: 'Elige año',
      chooseMonth: 'Elige mes',
      available: 'Disponible',
      unavailable: 'No disponible',
      todayLabel: 'Hoy',
      selectedDate: 'Fecha seleccionada',
      notSelected: 'No seleccionada',
      chooseTime: 'Elegir hora',
      from: 'desde',
      zeroMinutes: '0 min',
      monthsFull: [
        'Enero',
        'Febrero',
        'Marzo',
        'Abril',
        'Mayo',
        'Junio',
        'Julio',
        'Agosto',
        'Septiembre',
        'Octubre',
        'Noviembre',
        'Diciembre',
      ],
      monthsShort: ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'],
      weekdaysShort: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
    };
  }

  if (language === 'CZ') {
    return {
      bookingDataNotFound: 'Údaje rezervace nebyly nalezeny',
      chooseDate: 'Vyberte datum',
      selectedServices: 'Vybrané služby',
      totalDuration: 'Celková délka',
      totalPrice: 'Celková cena',
      today: 'Dnes',
      chooseYear: 'Vyberte rok',
      chooseMonth: 'Vyberte měsíc',
      available: 'Dostupné',
      unavailable: 'Nedostupné',
      todayLabel: 'Dnes',
      selectedDate: 'Vybrané datum',
      notSelected: 'Nevybráno',
      chooseTime: 'Vybrat čas',
      from: 'od',
      zeroMinutes: '0 min',
      monthsFull: [
        'Leden',
        'Únor',
        'Březen',
        'Duben',
        'Květen',
        'Červen',
        'Červenec',
        'Srpen',
        'Září',
        'Říjen',
        'Listopad',
        'Prosinec',
      ],
      monthsShort: ['led', 'úno', 'bře', 'dub', 'kvě', 'čen', 'čvc', 'srp', 'zář', 'říj', 'lis', 'pro'],
      weekdaysShort: ['Ne', 'Po', 'Út', 'St', 'Čt', 'Pá', 'So'],
    };
  }

  if (language === 'DE') {
    return {
      bookingDataNotFound: 'Buchungsdaten nicht gefunden',
      chooseDate: 'Datum wählen',
      selectedServices: 'Ausgewählte Leistungen',
      totalDuration: 'Gesamtdauer',
      totalPrice: 'Gesamtpreis',
      today: 'Heute',
      chooseYear: 'Jahr wählen',
      chooseMonth: 'Monat wählen',
      available: 'Verfügbar',
      unavailable: 'Nicht verfügbar',
      todayLabel: 'Heute',
      selectedDate: 'Ausgewähltes Datum',
      notSelected: 'Nicht ausgewählt',
      chooseTime: 'Zeit wählen',
      from: 'ab',
      zeroMinutes: '0 Min',
      monthsFull: [
        'Januar',
        'Februar',
        'März',
        'April',
        'Mai',
        'Juni',
        'Juli',
        'August',
        'September',
        'Oktober',
        'November',
        'Dezember',
      ],
      monthsShort: ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'],
      weekdaysShort: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'],
    };
  }

  if (language === 'PL') {
    return {
      bookingDataNotFound: 'Nie znaleziono danych rezerwacji',
      chooseDate: 'Wybierz datę',
      selectedServices: 'Wybrane usługi',
      totalDuration: 'Łączny czas',
      totalPrice: 'Łączna cena',
      today: 'Dziś',
      chooseYear: 'Wybierz rok',
      chooseMonth: 'Wybierz miesiąc',
      available: 'Dostępne',
      unavailable: 'Niedostępne',
      todayLabel: 'Dziś',
      selectedDate: 'Wybrana data',
      notSelected: 'Nie wybrano',
      chooseTime: 'Wybierz godzinę',
      from: 'od',
      zeroMinutes: '0 min',
      monthsFull: [
        'Styczeń',
        'Luty',
        'Marzec',
        'Kwiecień',
        'Maj',
        'Czerwiec',
        'Lipiec',
        'Sierpień',
        'Wrzesień',
        'Październik',
        'Listopad',
        'Grudzień',
      ],
      monthsShort: ['sty', 'lut', 'mar', 'kwi', 'maj', 'cze', 'lip', 'sie', 'wrz', 'paź', 'lis', 'gru'],
      weekdaysShort: ['Nd', 'Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'Sb'],
    };
  }

  return {
    bookingDataNotFound: 'Booking data not found',
    chooseDate: 'Choose date',
    selectedServices: 'Selected services',
    totalDuration: 'Total duration',
    totalPrice: 'Total price',
    today: 'Today',
    chooseYear: 'Choose year',
    chooseMonth: 'Choose month',
    available: 'Available',
    unavailable: 'Unavailable',
    todayLabel: 'Today',
    selectedDate: 'Selected date',
    notSelected: 'Not selected',
    chooseTime: 'Choose time',
    from: 'from',
    zeroMinutes: '0m',
    monthsFull: [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ],
    monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    weekdaysShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  };
}

function getMonthLabel(monthIndex: number, language: AppLanguage) {
  return getTexts(language).monthsFull[monthIndex];
}

function getShortMonthLabel(monthIndex: number, language: AppLanguage) {
  return getTexts(language).monthsShort[monthIndex];
}

function getWeekdayShort(date: Date, language: AppLanguage) {
  return getTexts(language).weekdaysShort[date.getDay()];
}

function getDateKey(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

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

function getStatusForDate(date: Date, today: Date): DateStatus {
  const normalizedToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const normalizedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (normalizedDate < normalizedToday) return 'full';

  const day = normalizedDate.getDate();

  if (day % 7 === 0) return 'full';
  return 'free';
}

function getStatusStyles(status: DateStatus, active: boolean, today: boolean) {
  if (active) {
    return {
      background: '#16a34a',
      color: '#ffffff',
      border: '2px solid #16a34a',
      boxShadow: '0 10px 22px rgba(22,163,74,0.25)',
    };
  }

  if (today) {
    return {
      background: '#dbeafe',
      color: '#1d4ed8',
      border: '2px solid #2563eb',
    };
  }

  if (status === 'free') {
    return {
      background: '#dcfce7',
      color: '#15803d',
      border: '1px solid #86efac',
    };
  }

  return {
    background: '#ffe4e6',
    color: '#e11d48',
    border: '1px solid #fda4af',
  };
}

export default function BookingDatePage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [language, setLanguage] = useState<AppLanguage>(getSavedLanguage());

  const text = useMemo(() => getTexts(language), [language]);

  const master = useMemo(() => getMasterById(String(params.id)), [params.id]);
  const servicesParam = searchParams.get('services') || '';

  const selectedServiceSlugs = servicesParam
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  const selectedItems = master
    ? master.services.filter((service) => selectedServiceSlugs.includes(service.slug))
    : [];

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const [activeYear, setActiveYear] = useState(today.getFullYear());
  const [activeMonth, setActiveMonth] = useState(today.getMonth());
  const [selectedDateKey, setSelectedDateKey] = useState('');
  const [pickerMode, setPickerMode] = useState<'closed' | 'year' | 'month'>('closed');

  useEffect(() => {
    setLanguage(getSavedLanguage());

    const unsubLanguage = subscribeToLanguageChange((nextLanguage) => {
      setLanguage(nextLanguage);
    });

    return () => {
      unsubLanguage();
    };
  }, []);

  if (!master || !selectedItems.length) {
    return <main style={{ padding: 24 }}>{text.bookingDataNotFound}</main>;
  }

  const totalPrice = selectedItems.reduce((sum, item) => sum + item.price, 0);
  const totalMinutes = selectedItems.reduce(
    (sum, item) => sum + parseDurationToMinutes(item.duration),
    0
  );

  const years = Array.from({ length: 3 }, (_, index) => today.getFullYear() + index);
  const monthDates = Array.from({ length: 12 }, (_, index) => new Date(activeYear, index, 1));

  const activeMonthDates = Array.from({ length: 31 }, (_, index) => new Date(activeYear, activeMonth, index + 1))
    .filter((date) => date.getMonth() === activeMonth);

  const selectedDate =
    selectedDateKey
      ? activeMonthDates.find((date) => getDateKey(date) === selectedDateKey) ||
        new Date(selectedDateKey)
      : null;

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

          <div style={{ fontSize: 30, fontWeight: 800 }}>{text.chooseDate}</div>

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
            <div style={{ background: '#f7f1e8', borderRadius: 18, padding: 12 }}>
              <div style={{ fontSize: 14, color: '#6c645c', fontWeight: 700 }}>
                {text.totalDuration}
              </div>
              <div style={{ fontSize: 24, fontWeight: 900, marginTop: 6 }}>
                {formatMinutes(totalMinutes, language)}
              </div>
            </div>

            <div style={{ background: '#f7f1e8', borderRadius: 18, padding: 12 }}>
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
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '42px 1fr 42px 42px',
              gap: 10,
              alignItems: 'center',
            }}
          >
            <button
              onClick={() => {
                const prev = new Date(activeYear, activeMonth - 1, 1);
                setActiveYear(prev.getFullYear());
                setActiveMonth(prev.getMonth());
              }}
              style={{
                width: 42,
                height: 42,
                borderRadius: 999,
                border: '1px solid #e4d8ca',
                background: '#fff',
                fontSize: 22,
                cursor: 'pointer',
              }}
            >
              ‹
            </button>

            <div style={{ fontSize: 24, fontWeight: 800, textAlign: 'center' }}>
              {getMonthLabel(activeMonth, language)} {activeYear}
            </div>

            <button
              onClick={() => setPickerMode(pickerMode === 'year' ? 'closed' : 'year')}
              style={{
                width: 42,
                height: 42,
                borderRadius: 999,
                border: '1px solid #e4d8ca',
                background: '#fff',
                fontSize: 20,
                cursor: 'pointer',
              }}
            >
              📅
            </button>

            <button
              onClick={() => {
                const next = new Date(activeYear, activeMonth + 1, 1);
                setActiveYear(next.getFullYear());
                setActiveMonth(next.getMonth());
              }}
              style={{
                width: 42,
                height: 42,
                borderRadius: 999,
                border: '1px solid #e4d8ca',
                background: '#fff',
                fontSize: 22,
                cursor: 'pointer',
              }}
            >
              ›
            </button>
          </div>

          <div style={{ marginTop: 10, color: '#6c645c', fontSize: 14, fontWeight: 700 }}>
            {text.today}: {today.getDate()} {getShortMonthLabel(today.getMonth(), language)} {today.getFullYear()}
          </div>

          {pickerMode === 'year' && (
            <div
              style={{
                marginTop: 14,
                background: '#fffaf2',
                border: '1px solid #eadfce',
                borderRadius: 20,
                padding: 14,
              }}
            >
              <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 10 }}>
                {text.chooseYear}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {years.map((year) => {
                  const active = activeYear === year;

                  return (
                    <button
                      key={year}
                      onClick={() => {
                        setActiveYear(year);
                        setPickerMode('month');
                      }}
                      style={{
                        padding: '14px 12px',
                        borderRadius: 18,
                        border: active ? '2px solid #16a34a' : '1px solid #e4d8ca',
                        background: active ? '#e6f8ec' : '#fff',
                        fontWeight: 800,
                        fontSize: 16,
                        cursor: 'pointer',
                      }}
                    >
                      {year}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {pickerMode === 'month' && (
            <div
              style={{
                marginTop: 14,
                background: '#fffaf2',
                border: '1px solid #eadfce',
                borderRadius: 20,
                padding: 14,
              }}
            >
              <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 10 }}>
                {text.chooseMonth}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {monthDates.map((date) => {
                  const active = activeMonth === date.getMonth();

                  return (
                    <button
                      key={date.getMonth()}
                      onClick={() => {
                        setActiveMonth(date.getMonth());
                        setPickerMode('closed');
                      }}
                      style={{
                        padding: '14px 12px',
                        borderRadius: 18,
                        border: active ? '2px solid #16a34a' : '1px solid #e4d8ca',
                        background: active ? '#e6f8ec' : '#fff',
                        fontWeight: 800,
                        fontSize: 15,
                        cursor: 'pointer',
                      }}
                    >
                      {getMonthLabel(date.getMonth(), language)} {activeYear}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div
            style={{
              marginTop: 16,
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 12,
            }}
          >
            {activeMonthDates.map((date) => {
              const key = getDateKey(date);
              const status = getStatusForDate(date, today);
              const active = selectedDateKey === key;
              const isToday = sameDay(date, today);
              const disabled = status === 'full';
              const styles = getStatusStyles(status, active, isToday);

              return (
                <button
                  key={key}
                  disabled={disabled}
                  onClick={() => {
                    if (disabled) return;
                    setSelectedDateKey(key);
                  }}
                  style={{
                    borderRadius: 20,
                    padding: '14px 10px',
                    textAlign: 'center',
                    opacity: disabled ? 0.8 : 1,
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    ...styles,
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 700 }}>
                    {getWeekdayShort(date, language)}
                  </div>
                  <div style={{ fontSize: 26, fontWeight: 900, marginTop: 4 }}>
                    {date.getDate()}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, marginTop: 4 }}>
                    {getShortMonthLabel(date.getMonth(), language)}
                  </div>
                </button>
              );
            })}
          </div>

          <div
            style={{
              display: 'flex',
              gap: 14,
              flexWrap: 'wrap',
              marginTop: 16,
              fontSize: 14,
              color: '#6d645c',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: 999,
                  background: '#dcfce7',
                  border: '1px solid #86efac',
                  display: 'inline-block',
                }}
              />
              {text.available}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: 999,
                  background: '#ffe4e6',
                  border: '1px solid #fda4af',
                  display: 'inline-block',
                }}
              />
              {text.unavailable}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: 999,
                  background: '#dbeafe',
                  border: '1px solid #60a5fa',
                  display: 'inline-block',
                }}
              />
              {text.todayLabel}
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
              {text.selectedDate}
            </div>
            <div style={{ fontSize: 22, fontWeight: 900, marginTop: 6 }}>
              {selectedDate
                ? `${selectedDate.getDate()} ${getShortMonthLabel(selectedDate.getMonth(), language)} ${selectedDate.getFullYear()}`
                : text.notSelected}
            </div>
          </div>

          <button
            disabled={!selectedDate}
            onClick={() => {
              if (!selectedDate) return;

              const servicesEncoded = encodeURIComponent(selectedServiceSlugs.join(','));
              const dateEncoded = encodeURIComponent(
                `${selectedDate.getDate()} ${getShortMonthLabel(selectedDate.getMonth(), language)} ${selectedDate.getFullYear()}`
              );

              router.push(
                `/booking/${master.id}/time?services=${servicesEncoded}&date=${dateEncoded}`
              );
            }}
            style={{
              border: 'none',
              background: selectedDate ? '#16a34a' : '#b7d9bf',
              color: '#fff',
              borderRadius: 24,
              padding: '18px 26px',
              fontWeight: 800,
              fontSize: 18,
              cursor: selectedDate ? 'pointer' : 'not-allowed',
            }}
          >
            {text.chooseTime}
          </button>
        </div>
      </div>
    </main>
  );
}
