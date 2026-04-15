'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import BottomNav from '../../../components/common/BottomNav';
import {
  getSavedLanguage,
  subscribeToLanguageChange,
  type AppLanguage,
} from '../../../services/i18n';
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
    overview: 'Notification overview',
    overviewSub: 'Control booking, message and system updates in one place',
    activeNow: 'Active now',
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
    protected: 'Protected by MapBook',
  },
  ES: {
    title: 'Notificaciones',
    subtitle: 'Elige qué quieres recibir de MapBook',
    overview: 'Resumen de notificaciones',
    overviewSub: 'Controla reservas, mensajes y actualizaciones del sistema en un solo lugar',
    activeNow: 'Activo ahora',
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
    protected: 'Protegido por MapBook',
  },
  RU: {
    title: 'Уведомления',
    subtitle: 'Выберите, какие уведомления получать от MapBook',
    overview: 'Обзор уведомлений',
    overviewSub: 'Управляйте сообщениями, бронями и системными обновлениями в одном месте',
    activeNow: 'Активно сейчас',
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
    protected: 'Защищено MapBook',
  },
  CZ: {
    title: 'Oznámení',
    subtitle: 'Vyberte, jaká oznámení chcete dostávat od MapBook',
    overview: 'Přehled oznámení',
    overviewSub: 'Spravujte rezervace, zprávy a systémové aktualizace na jednom místě',
    activeNow: 'Aktivní nyní',
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
    protected: 'Chráněno MapBook',
  },
  DE: {
    title: 'Benachrichtigungen',
    subtitle: 'Wähle, welche Mitteilungen du von MapBook erhalten möchtest',
    overview: 'Benachrichtigungsübersicht',
    overviewSub: 'Verwalte Buchungen, Nachrichten und Systemupdates an einem Ort',
    activeNow: 'Jetzt aktiv',
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
    protected: 'Durch MapBook geschützt',
  },
  PL: {
    title: 'Powiadomienia',
    subtitle: 'Wybierz, jakie powiadomienia chcesz otrzymywać od MapBook',
    overview: 'Przegląd powiadomień',
    overviewSub: 'Zarządzaj rezerwacjami, wiadomościami i aktualizacjami systemu w jednym miejscu',
    activeNow: 'Aktywne teraz',
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
    protected: 'Chronione przez MapBook',
  },
} as const;

type NotificationKey = keyof UserProfile['notificationSettings'];

function getCardAccent(key: NotificationKey) {
  if (key === 'messages') {
    return {
      iconBg: '#edf4ff',
      iconColor: '#2f7cf6',
      chipBg: '#edf4ff',
      chipColor: '#2f7cf6',
      toggleOn: '#2f7cf6',
      icon: '✉️',
    };
  }

  if (key === 'bookings') {
    return {
      iconBg: '#edf9ef',
      iconColor: '#2fa35a',
      chipBg: '#edf9ef',
      chipColor: '#2fa35a',
      toggleOn: '#45c63d',
      icon: '📅',
    };
  }

  if (key === 'reminders') {
    return {
      iconBg: '#fff4e7',
      iconColor: '#d68612',
      chipBg: '#fff4e7',
      chipColor: '#d68612',
      toggleOn: '#d68612',
      icon: '⏰',
    };
  }

  if (key === 'promotions') {
    return {
      iconBg: '#fff0f6',
      iconColor: '#ff4fa0',
      chipBg: '#fff0f6',
      chipColor: '#ff4fa0',
      toggleOn: '#ff4fa0',
      icon: '🎁',
    };
  }

  return {
    iconBg: '#f3efff',
    iconColor: '#7a5af8',
    chipBg: '#f3efff',
    chipColor: '#7a5af8',
    toggleOn: '#7a5af8',
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

    const unsubLanguage = subscribeToLanguageChange((nextLanguage) => {
      setLanguage(nextLanguage);
    });
    const unsubProfile = subscribeToUserProfile(syncProfile);

    window.addEventListener('focus', syncLanguage);

    return () => {
      window.removeEventListener('focus', syncLanguage);
      unsubLanguage();
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

  const enabledCount = items.filter((item) => profile.notificationSettings[item.key]).length;

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#f7f4ee',
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
              border: '2px solid #111111',
              background: '#fff',
              fontSize: 26,
              fontWeight: 900,
              cursor: 'pointer',
              color: '#17130f',
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

        <div
          style={{
            marginTop: 18,
            borderRadius: 32,
            border: '2px solid #111111',
            background: '#ffffff',
            padding: 18,
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr auto',
              gap: 14,
              alignItems: 'start',
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 900,
                  color: '#17130f',
                }}
              >
                {text.overview}
              </div>
              <div
                style={{
                  marginTop: 6,
                  fontSize: 14,
                  lineHeight: 1.5,
                  color: '#6f7782',
                  fontWeight: 700,
                }}
              >
                {text.overviewSub}
              </div>
            </div>

            <div
              style={{
                minWidth: 82,
                borderRadius: 24,
                border: '2px solid #111111',
                background: '#fff0f6',
                color: '#ff4fa0',
                padding: '12px 12px 10px',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontSize: 24,
                  fontWeight: 900,
                  lineHeight: 1,
                }}
              >
                {enabledCount}
              </div>
              <div
                style={{
                  marginTop: 4,
                  fontSize: 11,
                  fontWeight: 900,
                }}
              >
                {text.activeNow}
              </div>
            </div>
          </div>

          <div
            style={{
              marginTop: 14,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              borderRadius: 999,
              padding: '10px 14px',
              background: '#edf9ef',
              color: '#2fa35a',
              border: '2px solid #111111',
              fontSize: 12,
              fontWeight: 900,
            }}
          >
            <span>🛡️</span>
            <span>{text.protected}</span>
          </div>
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
                  border: '2px solid #111111',
                  background: '#fff',
                  padding: 16,
                }}
              >
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '52px 1fr auto',
                    alignItems: 'center',
                    gap: 14,
                  }}
                >
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 18,
                      background: accent.iconBg,
                      color: accent.iconColor,
                      border: '2px solid #111111',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 24,
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
                          border: '2px solid #111111',
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
                        lineHeight: 1.45,
                        color: '#6f7782',
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
                      width: 66,
                      height: 38,
                      borderRadius: 999,
                      border: '2px solid #111111',
                      background: enabled ? accent.toggleOn : '#ddd1c3',
                      cursor: 'pointer',
                    }}
                  >
                    <span
                      style={{
                        position: 'absolute',
                        top: 3,
                        left: enabled ? 31 : 3,
                        width: 28,
                        height: 28,
                        borderRadius: 999,
                        background: '#fff',
                        border: '2px solid #111111',
                        transition: 'all 0.2s ease',
                      }}
                    />
                  </button>
                </div>

                <div
                  style={{
                    marginTop: 14,
                    borderRadius: 22,
                    background: '#fcfaf6',
                    border: '2px solid #111111',
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
                      color: '#6f7782',
                      fontWeight: 800,
                    }}
                  >
                    {enabled ? text.enabled : text.disabled}
                  </div>

                  <div
                    style={{
                      borderRadius: 999,
                      padding: '7px 10px',
                      background: enabled ? '#edf9ef' : '#f4efe8',
                      color: enabled ? '#2fa35a' : '#7d7268',
                      border: '2px solid #111111',
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
