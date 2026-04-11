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
    subtitle: 'Choose what you want to receive from MapBook',
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
    enabled: 'Enabled',
    disabled: 'Disabled',
    important: 'Important',
    recommended: 'Recommended',
  },
  ES: {
    title: 'Notificaciones',
    subtitle: 'Elige qué quieres recibir de MapBook',
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
    enabled: 'Activo',
    disabled: 'Desactivado',
    important: 'Importante',
    recommended: 'Recomendado',
  },
  RU: {
    title: 'Уведомления',
    subtitle: 'Выберите, какие уведомления получать от MapBook',
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
    enabled: 'Включено',
    disabled: 'Выключено',
    important: 'Важно',
    recommended: 'Рекомендуется',
  },
  CZ: {
    title: 'Oznámení',
    subtitle: 'Vyberte, jaká oznámení chcete dostávat od MapBook',
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
    enabled: 'Zapnuto',
    disabled: 'Vypnuto',
    important: 'Důležité',
    recommended: 'Doporučeno',
  },
  DE: {
    title: 'Benachrichtigungen',
    subtitle: 'Wähle, welche Mitteilungen du von MapBook erhalten möchtest',
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
    enabled: 'Aktiv',
    disabled: 'Inaktiv',
    important: 'Wichtig',
    recommended: 'Empfohlen',
  },
  PL: {
    title: 'Powiadomienia',
    subtitle: 'Wybierz, jakie powiadomienia chcesz otrzymywać od MapBook',
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
    enabled: 'Włączone',
    disabled: 'Wyłączone',
    important: 'Ważne',
    recommended: 'Zalecane',
  },
} as const;

type NotificationKey = keyof UserProfile['notificationSettings'];

function getCardAccent(key: NotificationKey) {
  if (key === 'messages') {
    return {
      iconBg: '#eef4ff',
      iconColor: '#2f7cf6',
      chipBg: '#eef4ff',
      chipColor: '#2f7cf6',
      icon: '✉️',
    };
  }

  if (key === 'bookings') {
    return {
      iconBg: '#eef9f1',
      iconColor: '#2fa35a',
      chipBg: '#eef9f1',
      chipColor: '#2fa35a',
      icon: '📅',
    };
  }

  if (key === 'reminders') {
    return {
      iconBg: '#fff5e8',
      iconColor: '#d68612',
      chipBg: '#fff5e8',
      chipColor: '#d68612',
      icon: '⏰',
    };
  }

  if (key === 'promotions') {
    return {
      iconBg: '#fff1f7',
      iconColor: '#ff4fa0',
      chipBg: '#fff1f7',
      chipColor: '#ff4fa0',
      icon: '🎁',
    };
  }

  return {
    iconBg: '#f3efff',
    iconColor: '#7a5af8',
    chipBg: '#f3efff',
    chipColor: '#7a5af8',
    icon: '🛡️',
  };
}

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
      badge: text.recommended,
    },
    {
      key: 'bookings' as NotificationKey,
      title: text.bookings,
      subtitle: text.bookingsSub,
      badge: text.important,
    },
    {
      key: 'reminders' as NotificationKey,
      title: text.reminders,
      subtitle: text.remindersSub,
      badge: text.recommended,
    },
    {
      key: 'promotions' as NotificationKey,
      title: text.promotions,
      subtitle: text.promotionsSub,
      badge: text.recommended,
    },
    {
      key: 'system' as NotificationKey,
      title: text.system,
      subtitle: text.systemSub,
      badge: text.important,
    },
  ];

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#fbf7ef',
        padding: '20px 16px 110px',
      }}
    >
      <div style={{ maxWidth: 430, margin: '0 auto' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '54px 1fr 54px',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <button
            type="button"
            onClick={() => router.back()}
            style={{
              width: 54,
              height: 54,
              borderRadius: 999,
              border: '1px solid #efe4d7',
              background: '#fff',
              fontSize: 26,
              boxShadow: '0 10px 22px rgba(44, 23, 10, 0.05)',
              cursor: 'pointer',
            }}
          >
            ←
          </button>

          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                fontSize: 22,
                fontWeight: 900,
                color: '#17130f',
              }}
            >
              {text.title}
            </div>
            <div
              style={{
                marginTop: 4,
                fontSize: 13,
                color: '#7b7268',
                fontWeight: 700,
              }}
            >
              {text.subtitle}
            </div>
          </div>

          <div />
        </div>

        <div style={{ marginTop: 18, display: 'grid', gap: 14 }}>
          {items.map((item) => {
            const enabled = profile.notificationSettings[item.key];
            const accent = getCardAccent(item.key);

            return (
              <div
                key={item.key}
                style={{
                  borderRadius: 30,
                  border: '1px solid #efe4d7',
                  background: '#fff',
                  padding: 16,
                  boxShadow: '0 12px 28px rgba(44, 23, 10, 0.05)',
                }}
              >
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '48px 1fr auto',
                    alignItems: 'center',
                    gap: 14,
                  }}
                >
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 18,
                      background: accent.iconBg,
                      color: accent.iconColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 22,
                    }}
                  >
                    {accent.icon}
                  </div>

                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        gap: 8,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 16,
                          fontWeight: 900,
                          color: '#17130f',
                        }}
                      >
                        {item.title}
                      </div>

                      <span
                        style={{
                          borderRadius: 999,
                          padding: '6px 10px',
                          background: accent.chipBg,
                          color: accent.chipColor,
                          fontSize: 11,
                          fontWeight: 900,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {item.badge}
                      </span>
                    </div>

                    <div
                      style={{
                        marginTop: 6,
                        fontSize: 13,
                        lineHeight: 1.5,
                        color: '#7b7268',
                        fontWeight: 700,
                      }}
                    >
                      {item.subtitle}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleSetting(item.key)}
                    style={{
                      position: 'relative',
                      width: 62,
                      height: 36,
                      borderRadius: 999,
                      border: 'none',
                      background: enabled ? '#ff4fa0' : '#ddd1c3',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: enabled ? '0 10px 20px rgba(255,79,160,0.18)' : 'none',
                    }}
                  >
                    <span
                      style={{
                        position: 'absolute',
                        top: 4,
                        left: enabled ? 30 : 4,
                        width: 28,
                        height: 28,
                        borderRadius: 999,
                        background: '#fff',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.12)',
                      }}
                    />
                  </button>
                </div>

                <div
                  style={{
                    marginTop: 14,
                    borderRadius: 20,
                    background: '#fcfaf6',
                    border: '1px solid #f1e8dc',
                    padding: '12px 14px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 12,
                    alignItems: 'center',
                  }}
                >
                  <div
                    style={{
                      fontSize: 13,
                      color: '#7b7268',
                      fontWeight: 800,
                    }}
                  >
                    {enabled ? text.enabled : text.disabled}
                  </div>

                  <div
                    style={{
                      borderRadius: 999,
                      padding: '7px 10px',
                      background: enabled ? '#eef9f1' : '#f4efe8',
                      color: enabled ? '#2fa35a' : '#7d7268',
                      fontSize: 12,
                      fontWeight: 900,
                    }}
                  >
                    {enabled ? text.enabled : text.disabled}
                  </div>
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
