'use client';

import { useMemo, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { getMasterById } from '../../../services/masters';

type DateStatus = 'available' | 'partial' | 'full';

type CalendarDay = {
  iso: string;
  dayNumber: number;
  isCurrentMonth: boolean;
  status: DateStatus;
};

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const monthNames = [
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
];

function formatIso(date: Date) {
  return date.toISOString().slice(0, 10);
}

function getDateStatus(date: Date): DateStatus {
  const day = date.getDate();
  if (day % 5 === 0) return 'full';
  if (day % 2 === 0) return 'partial';
  return 'available';
}

function buildCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const startWeekday = firstDay.getDay();
  const daysInMonth = lastDay.getDate();

  const prevMonthLastDay = new Date(year, month, 0).getDate();
  const days: CalendarDay[] = [];

  for (let i = startWeekday - 1; i >= 0; i -= 1) {
    const date = new Date(year, month - 1, prevMonthLastDay - i);
    days.push({
      iso: formatIso(date),
      dayNumber: date.getDate(),
      isCurrentMonth: false,
      status: getDateStatus(date),
    });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(year, month, day);
    days.push({
      iso: formatIso(date),
      dayNumber: day,
      isCurrentMonth: true,
      status: getDateStatus(date),
    });
  }

  while (days.length % 7 !== 0) {
    const nextDay = days.length - (startWeekday + daysInMonth) + 1;
    const date = new Date(year, month + 1, nextDay);
    days.push({
      iso: formatIso(date),
      dayNumber: date.getDate(),
      isCurrentMonth: false,
      status: getDateStatus(date),
    });
  }

  return days;
}

export default function BookingDatePage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const master = useMemo(() => getMasterById(String(params.id)), [params.id]);
  const serviceSlug = searchParams.get('service') || '';

  const today = new Date();
  const minYear = today.getFullYear();
  const maxYear = today.getFullYear() + 1;

  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth());

  if (!master) {
    return <main style={{ padding: 24 }}>Master not found</main>;
  }

  const service =
    master.services.find((item)
