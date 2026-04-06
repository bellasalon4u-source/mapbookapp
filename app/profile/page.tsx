'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import BottomNav from '../../components/common/BottomNav';
import { getSavedLanguage, type AppLanguage } from '../../services/i18n';

const profileTexts = {
  EN: {
    title: 'Profile',
    subtitle: 'Manage your account, bookings and preferences',
    editProfile: 'Edit profile',
    upcomingBookings: 'Upcoming bookings',
    savedMasters: 'Saved masters',
    messages: 'Messages',
    likedPins: 'Liked pins',
    latestBooking: 'My latest booking',
    paymentMethods: 'Payment methods',
    notifications: 'Notifications',
    languageRegion: 'Language & region',
    logout: 'Log out',
  },
  ES: {
    title: 'Perfil',
    subtitle: 'Administra tu cuenta, reservas y preferencias',
    editProfile: 'Editar perfil',
    upcomingBookings: 'Próximas reservas',
    savedMasters: 'Profesionales guardados',
    messages: 'Mensajes',
    likedPins: 'Pins guardados',
    latestBooking: 'Mi última reserva',
    paymentMethods: 'Métodos de pago',
    notifications: 'Notificaciones',
    languageRegion: 'Idioma y región',
    logout: 'Cerrar sesión',
  },
  RU: {
    title: 'Профиль',
    subtitle: 'Управляйте аккаунтом, бронированиями и настройками',
    editProfile: 'Редактировать профиль',
    upcomingBookings: 'Предстоящие бронирования',
    savedMasters: 'Сохранённые мастера',
    messages: 'Сообщения',
    likedPins: 'Избранные пины',
    latestBooking: 'Моё последнее бронирование',
    paymentMethods: 'Способы оплаты',
    notifications: 'Уведомления',
    languageRegion: 'Язык и регион',
    logout: 'Выйти',
  },
  CZ: {
    title: 'Profil',
    subtitle: 'Spravujte svůj účet, rezervace a nastavení',
    editProfile: 'Upravit profil',
    upcomingBookings: 'Nadcházející rezervace',
    savedMasters: 'Uložení specialisté',
    messages: 'Zprávy',
    likedPins: 'Oblíbené piny',
    latestBooking: 'Moje poslední rezervace',
    paymentMethods: 'Platební metody',
    notifications: 'Oznámení',
    languageRegion: 'Jazyk a region',
    logout: 'Odhlásit se',
  },
  DE: {
    title: 'Profil',
    subtitle: 'Verwalte dein Konto, Buchungen und Einstellungen',
    editProfile: 'Profil bearbeiten',
    upcomingBookings: 'Bevorstehende Buchungen',
    savedMasters: 'Gespeicherte Profis',
    messages: 'Nachrichten',
    likedPins: 'Gespeicherte Pins',
    latestBooking: 'Meine letzte Buchung',
    paymentMethods: 'Zahlungsmethoden',
    notifications: 'Benachrichtigungen',
    languageRegion: 'Sprache & Region',
    logout: 'Abmelden',
  },
  PL: {
    title: 'Profil',
    subtitle: 'Zarządzaj kontem, rezerwacjami i ustawieniami',
    editProfile: 'Edytuj profil',
    upcomingBookings: 'Nadchodzące rezerwacje',
    savedMasters: 'Zapisani specjaliści',
    messages: 'Wiadomości',
    likedPins: 'Polubione pinezki',
    latestBooking: 'Moja ostatnia rezerwacja',
    paymentMethods: 'Metody płatności',
    notifications: 'Powiadomienia',
    languageRegion: 'Język i region',
    logout: 'Wyloguj się',
  },
} as const;

export default function ProfilePage() {
  const [language, setLanguage] = useState<AppLanguage>('EN');

  useEffect(() => {
    setLanguage(getSavedLanguage());

    const handleFocus = () => {
      setLanguage(getSavedLanguage());
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const text = profileTexts[language as keyof typeof profileTexts] || profileTexts.EN;

  return (
    <main className="min-h-screen bg-[#fcf8f2] px-4 py-6 pb-24">
      <div className="mx-auto max-w-md">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#1d1712]">{text.title}</h1>
            <p className="mt-1 text-sm text-[#7a7065]">{text.subtitle}</p>
          </div>

          <Link
            href="/"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-xl text-[#241c16] shadow-sm"
          >
            ←
          </Link>
        </div>

        <div className="mt-6 rounded-[32px] border border-[#efe4d7] bg-white p-5">
          <div className="flex items-center gap-4">
            <img
              src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1200&auto=format&fit=crop"
              alt="Profile"
              className="h-20 w-20 rounded-3xl object-cover"
            />

            <div>
              <h2 className="text-xl font-bold text-[#1d1712]">Alex Carter</h2>
              <p className="mt-1 text-sm text-[#7a7065]">alex@email.com</p>
              <p className="mt-1 text-sm text-[#7a7065]">+44 7700 123456</p>
            </div>
          </div>

          <button className="mt-5 w-full rounded-2xl bg-[#2f241c] px-4 py-4 text-sm font-bold text-white">
            {text.editProfile}
          </button>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="rounded-3xl bg-[#2f241c] p-4 text-white">
            <p className="text-xs text-[#d9cdbd]">{text.upcomingBookings}</p>
            <p className="mt-2 text-3xl font-bold">3</p>
          </div>

          <div className="rounded-3xl bg-[#f2e9dc] p-4 text-[#241d17]">
            <p className="text-xs text-[#6e5f51]">{text.savedMasters}</p>
            <p className="mt-2 text-3xl font-bold">8</p>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <Link
            href="/messages"
            className="block rounded-3xl border border-[#efe4d7] bg-white px-5 py-4 text-sm font-bold text-[#1d1712]"
          >
            {text.messages}
          </Link>

          <Link
            href="/favorites"
            className="block rounded-3xl border border-[#efe4d7] bg-white px-5 py-4 text-sm font-bold text-[#1d1712]"
          >
            {text.likedPins}
          </Link>

          <Link
            href="/booking-success"
            className="block rounded-3xl border border-[#efe4d7] bg-white px-5 py-4 text-sm font-bold text-[#1d1712]"
          >
            {text.latestBooking}
          </Link>

          <button className="w-full rounded-3xl border border-[#efe4d7] bg-white px-5 py-4 text-left text-sm font-bold text-[#1d1712]">
            {text.paymentMethods}
          </button>

          <button className="w-full rounded-3xl border border-[#efe4d7] bg-white px-5 py-4 text-left text-sm font-bold text-[#1d1712]">
            {text.notifications}
          </button>

          <button className="w-full rounded-3xl border border-[#efe4d7] bg-white px-5 py-4 text-left text-sm font-bold text-[#1d1712]">
            {text.languageRegion}
          </button>

          <button className="w-full rounded-3xl border border-[#efe4d7] bg-white px-5 py-4 text-left text-sm font-bold text-red-600">
            {text.logout}
          </button>
        </div>
      </div>

      <BottomNav active="profile" />
    </main>
  );
}
