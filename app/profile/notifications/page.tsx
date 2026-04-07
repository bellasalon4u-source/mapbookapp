'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import BottomNav from '../../../components/common/BottomNav';
import { getSavedLanguage, type AppLanguage } from '../../../services/i18n';
import {
  getUserProfile,
  subscribeToUserProfile,
  updateUserProfile,
  type UserProfile,
} from '../../services/userProfileStore';

const notificationTexts = {
  EN: {
    title: 'Notifications',
    messages: 'Messages',
    messagesSub: 'New chats and replies from professionals',
    bookings: 'Bookings',
    bookingsSub: 'Booking updates and confirmations',
    reminders: 'Reminders',
    remindersSub: 'Upcoming visit reminders',
    promotions: 'Promotions',
    promotionsSub: 'Special offers and bonuses',
    system: 'System notifications',
    systemSub: 'Important account and app updates',
  },
  ES: {
    title: 'Notificaciones',
    messages: 'Mensajes',
    messagesSub: 'Nuevos chats y respuestas de profesionales',
    bookings: 'Reservas',
    bookingsSub: 'Actualizaciones y confirmaciones de reservas',
    reminders: 'Recordatorios',
    remindersSub: 'Recordatorios de próximas visitas',
    promotions: 'Promociones',
    promotionsSub: 'Ofertas especiales y bonos',
    system: 'Notificaciones del sistema',
    systemSub: 'Actualizaciones importantes de cuenta y app',
  },
  RU: {
    title: 'Уведомления',
    messages: 'Сообщения',
    messagesSub: 'Новые чаты и ответы от мастеров',
    bookings: 'Бронирования',
    bookingsSub: 'Обновления и подтверждения по бронированиям',
    reminders: 'Напоминания',
    remindersSub: 'Напоминания о предстоящих визитах',
    promotions: 'Акции',
    promotionsSub: 'Специальные предложения и бонусы',
    system: 'Системные уведомления',
    systemSub: 'Важные обновления аккаунта и приложения',
  },
  CZ: {
    title: 'Oznámení',
    messages: 'Zprávy',
    messagesSub: 'Nové chaty a odpovědi od specialistů',
    bookings: 'Rezervace',
    bookingsSub: 'Aktualizace a potvrzení rezervací',
    reminders: 'Připomínky',
    remindersSub: 'Připomínky nadcházejících návštěv',
    promotions: 'Akce',
    promotionsSub: 'Speciální nabídky a bonusy',
    system: 'Systémová oznámení',
    systemSub: 'Důležité aktualizace účtu a aplikace',
  },
  DE: {
    title: 'Benachrichtigungen',
    messages: 'Nachrichten',
    messagesSub: 'Neue Chats und Antworten von Profis',
    bookings: 'Buchungen',
    bookingsSub: 'Updates und Bestätigungen zu Buchungen',
    reminders: 'Erinnerungen',
    remindersSub: 'Erinnerungen an bevorstehende Termine',
    promotions: 'Aktionen',
    promotionsSub: 'Sonderangebote und Boni',
    system: 'Systembenachrichtigungen',
    systemSub: 'Wichtige Konto- und App-Updates',
  },
  PL: {
    title: 'Powiadomienia',
    messages: 'Wiadomości',
    messagesSub: 'Nowe czaty i odpowiedzi od specjalistów',
    bookings: 'Rezerwacje',
    bookingsSub: 'Aktualizacje i potwierdzenia rezerwacji',
    reminders: 'Przypomnienia',
    remindersSub: 'Przypomnienia o nadchodzących wizytach',
    promotions: 'Promocje',
    promotionsSub: 'Oferty specjalne i bonusy',
    system: 'Powiadomienia systemowe',
    systemSub: 'Ważne aktualizacje konta i aplikacji',
  },
} as const;

type NotificationKey = keyof UserProfile['notificationSettings'];

export default function NotificationsPage() {
  const router = useRouter();

  const [language, setLanguage] = useState<AppLanguage>('EN');
  const [profile, setProfile] = useState<UserProfile>(getUserProfile());

  useEffect(() => {
    const syncLanguage = () => {
      setLanguage(getSavedLanguage());
    };

    const syncProfile = () => {
      setProfile(getUserProfile());
    };

    syncLanguage();
    syncProfile();

    window.addEventListener('focus', syncLanguage);
    const unsubProfile = subscribeToUserProfile(syncProfile);

    return () => {
      window.removeEventListener('focus', syncLanguage);
      unsubProfile();
    };
  }, []);

  const text = useMemo(
    () => notificationTexts[language as keyof typeof notificationTexts] || notificationTexts.EN,
    [language]
  );

  const toggleSetting = (key: NotificationKey) => {
    updateUserProfile({
      notificationSettings: {
        ...profile.notificationSettings,
        [key]: !profile.notificationSettings[key],
      },
    });
  };

  const items = [
    {
      key: 'messages' as NotificationKey,
      title: text.messages,
      subtitle: text.messagesSub,
    },
    {
      key: 'bookings' as NotificationKey,
      title: text.bookings,
      subtitle: text.bookingsSub,
    },
    {
      key: 'reminders' as NotificationKey,
      title: text.reminders,
      subtitle: text.remindersSub,
    },
    {
      key: 'promotions' as NotificationKey,
      title: text.promotions,
      subtitle: text.promotionsSub,
    },
    {
      key: 'system' as NotificationKey,
      title: text.system,
      subtitle: text.systemSub,
    },
  ];

  return (
    <main className="min-h-screen bg-[#fcf8f2] px-4 py-6 pb-24">
      <div className="mx-auto max-w-md">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-xl text-[#241c16] shadow-sm"
          >
            ←
          </button>

          <h1 className="text-xl font-bold text-[#1d1712]">{text.title}</h1>

          <div className="h-11 w-11" />
        </div>

        <div className="mt-6 space-y-4">
          {items.map((item) => {
            const enabled = profile.notificationSettings[item.key];

            return (
              <div
                key={item.key}
                className="rounded-[28px] border border-[#efe4d7] bg-white p-4 shadow-sm"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="text-sm font-extrabold text-[#1d1712]">
                      {item.title}
                    </div>
                    <div className="mt-1 text-xs leading-5 text-[#7a7065]">
                      {item.subtitle}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleSetting(item.key)}
                    className={`relative h-8 w-14 rounded-full transition ${
                      enabled ? 'bg-[#2f241c]' : 'bg-[#ddd1c3]'
                    }`}
                  >
                    <span
                      className={`absolute top-1 h-6 w-6 rounded-full bg-white transition ${
                        enabled ? 'left-7' : 'left-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <BottomNav active="profile" />
    </main>
  );
}
