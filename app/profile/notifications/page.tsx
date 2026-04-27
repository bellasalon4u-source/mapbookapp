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

type NotificationKey = keyof UserProfile['notificationSettings'];

type NotificationTextShape = {
  title: string;
  subtitle: string;
  overview: string;
  overviewSub: string;
  activeNow: string;
  totalTypes: string;
  protected: string;
  messages: string;
  messagesSub: string;
  bookings: string;
  bookingsSub: string;
  reminders: string;
  remindersSub: string;
  promotions: string;
  promotionsSub: string;
  system: string;
  systemSub: string;
  enabled: string;
  disabled: string;
  important: string;
  recommended: string;
};

const BRAND = {
  navy: '#071b46',
  blue: '#0e73d8',
  green: '#24c45a',
  yellow: '#ffd629',
  pink: '#ff4f9a',
  softBlue: '#dcecff',
  softGreen: '#dcffe8',
  softPink: '#ffe9f2',
  softViolet: '#f2edff',
  softOrange: '#fff0da',
  bg: '#ffffff',
  border: '#050505',
  muted: '#6c7686',
};

const notificationTexts: Record<AppLanguage, NotificationTextShape> = {
  EN: {
    title: 'Notifications',
    subtitle: 'Choose what you want to receive from Olamep',
    overview: 'Notification control',
    overviewSub: 'Manage messages, bookings, reminders and app updates in one place.',
    activeNow: 'Active now',
    totalTypes: 'Total types',
    protected: 'Protected by Olamep',
    messages: 'Messages',
    messagesSub: 'New chats and replies from professionals',
    bookings: 'Bookings',
    bookingsSub: 'Booking updates and confirmations',
    reminders: 'Reminders',
    remindersSub: 'Upcoming visit reminders',
    promotions: 'Promotions',
    promotionsSub: 'Special offers, ads and bonuses',
    system: 'System notifications',
    systemSub: 'Important account and app updates',
    enabled: 'Enabled',
    disabled: 'Disabled',
    important: 'Important',
    recommended: 'Recommended',
  },
  RU: {
    title: 'Уведомления',
    subtitle: 'Выберите, какие уведомления получать от Olamep',
    overview: 'Управление уведомлениями',
    overviewSub: 'Сообщения, брони, напоминания и обновления приложения в одном месте.',
    activeNow: 'Активно',
    totalTypes: 'Всего типов',
    protected: 'Защищено Olamep',
    messages: 'Сообщения',
    messagesSub: 'Новые чаты и ответы от мастеров',
    bookings: 'Бронирования',
    bookingsSub: 'Обновления и подтверждения по бронированиям',
    reminders: 'Напоминания',
    remindersSub: 'Напоминания о предстоящих визитах',
    promotions: 'Промоакции',
    promotionsSub: 'Спецпредложения, реклама и бонусы',
    system: 'Системные уведомления',
    systemSub: 'Важные обновления аккаунта и приложения',
    enabled: 'Включено',
    disabled: 'Выключено',
    important: 'Важно',
    recommended: 'Рекомендуется',
  },
  UA: {
    title: 'Сповіщення',
    subtitle: 'Оберіть, які сповіщення отримувати від Olamep',
    overview: 'Керування сповіщеннями',
    overviewSub: 'Повідомлення, бронювання, нагадування та оновлення додатка в одному місці.',
    activeNow: 'Активно',
    totalTypes: 'Усього типів',
    protected: 'Захищено Olamep',
    messages: 'Повідомлення',
    messagesSub: 'Нові чати та відповіді від майстрів',
    bookings: 'Бронювання',
    bookingsSub: 'Оновлення та підтвердження бронювань',
    reminders: 'Нагадування',
    remindersSub: 'Нагадування про майбутні візити',
    promotions: 'Промоакції',
    promotionsSub: 'Спецпропозиції, реклама та бонуси',
    system: 'Системні сповіщення',
    systemSub: 'Важливі оновлення акаунта і додатка',
    enabled: 'Увімкнено',
    disabled: 'Вимкнено',
    important: 'Важливо',
    recommended: 'Рекомендується',
  },
  ES: {
    title: 'Notificaciones',
    subtitle: 'Elige qué quieres recibir de Olamep',
    overview: 'Control de notificaciones',
    overviewSub: 'Gestiona mensajes, reservas, recordatorios y actualizaciones en un lugar.',
    activeNow: 'Activo ahora',
    totalTypes: 'Total tipos',
    protected: 'Protegido por Olamep',
    messages: 'Mensajes',
    messagesSub: 'Nuevos chats y respuestas de profesionales',
    bookings: 'Reservas',
    bookingsSub: 'Actualizaciones y confirmaciones de reservas',
    reminders: 'Recordatorios',
    remindersSub: 'Recordatorios de próximas visitas',
    promotions: 'Promociones',
    promotionsSub: 'Ofertas, anuncios y bonos',
    system: 'Sistema',
    systemSub: 'Actualizaciones importantes de cuenta y app',
    enabled: 'Activo',
    disabled: 'Desactivado',
    important: 'Importante',
    recommended: 'Recomendado',
  },
  CZ: {
    title: 'Oznámení',
    subtitle: 'Vyberte, jaká oznámení chcete dostávat od Olamep',
    overview: 'Správa oznámení',
    overviewSub: 'Zprávy, rezervace, připomínky a aktualizace aplikace na jednom místě.',
    activeNow: 'Aktivní',
    totalTypes: 'Celkem typů',
    protected: 'Chráněno Olamep',
    messages: 'Zprávy',
    messagesSub: 'Nové chaty a odpovědi od specialistů',
    bookings: 'Rezervace',
    bookingsSub: 'Aktualizace a potvrzení rezervací',
    reminders: 'Připomínky',
    remindersSub: 'Připomínky nadcházejících návštěv',
    promotions: 'Promo akce',
    promotionsSub: 'Speciální nabídky, reklamy a bonusy',
    system: 'Systémová oznámení',
    systemSub: 'Důležité aktualizace účtu a aplikace',
    enabled: 'Zapnuto',
    disabled: 'Vypnuto',
    important: 'Důležité',
    recommended: 'Doporučeno',
  },
  DE: {
    title: 'Benachrichtigungen',
    subtitle: 'Wähle, was du von Olamep erhalten möchtest',
    overview: 'Benachrichtigungen',
    overviewSub: 'Nachrichten, Buchungen, Erinnerungen und App-Updates an einem Ort.',
    activeNow: 'Aktiv',
    totalTypes: 'Typen gesamt',
    protected: 'Geschützt durch Olamep',
    messages: 'Nachrichten',
    messagesSub: 'Neue Chats und Antworten von Profis',
    bookings: 'Buchungen',
    bookingsSub: 'Updates und Bestätigungen zu Buchungen',
    reminders: 'Erinnerungen',
    remindersSub: 'Erinnerungen an bevorstehende Termine',
    promotions: 'Aktionen',
    promotionsSub: 'Angebote, Anzeigen und Boni',
    system: 'System',
    systemSub: 'Wichtige Konto- und App-Updates',
    enabled: 'Aktiv',
    disabled: 'Inaktiv',
    important: 'Wichtig',
    recommended: 'Empfohlen',
  },
  IT: {
    title: 'Notifiche',
    subtitle: 'Scegli cosa ricevere da Olamep',
    overview: 'Controllo notifiche',
    overviewSub: 'Gestisci messaggi, prenotazioni, promemoria e aggiornamenti in un posto.',
    activeNow: 'Attive',
    totalTypes: 'Tipi totali',
    protected: 'Protetto da Olamep',
    messages: 'Messaggi',
    messagesSub: 'Nuove chat e risposte dai professionisti',
    bookings: 'Prenotazioni',
    bookingsSub: 'Aggiornamenti e conferme prenotazioni',
    reminders: 'Promemoria',
    remindersSub: 'Promemoria visite imminenti',
    promotions: 'Promozioni',
    promotionsSub: 'Offerte, annunci e bonus',
    system: 'Sistema',
    systemSub: 'Aggiornamenti importanti account e app',
    enabled: 'Attivo',
    disabled: 'Disattivo',
    important: 'Importante',
    recommended: 'Consigliato',
  },
  FR: {
    title: 'Notifications',
    subtitle: 'Choisissez ce que vous voulez recevoir de Olamep',
    overview: 'Contrôle des notifications',
    overviewSub: 'Gérez messages, réservations, rappels et mises à jour au même endroit.',
    activeNow: 'Actives',
    totalTypes: 'Types total',
    protected: 'Protégé par Olamep',
    messages: 'Messages',
    messagesSub: 'Nouveaux chats et réponses des pros',
    bookings: 'Réservations',
    bookingsSub: 'Mises à jour et confirmations',
    reminders: 'Rappels',
    remindersSub: 'Rappels de visites à venir',
    promotions: 'Promotions',
    promotionsSub: 'Offres, pubs et bonus',
    system: 'Système',
    systemSub: 'Mises à jour importantes du compte et de l’app',
    enabled: 'Activé',
    disabled: 'Désactivé',
    important: 'Important',
    recommended: 'Recommandé',
  },
  PL: {
    title: 'Powiadomienia',
    subtitle: 'Wybierz, co chcesz otrzymywać od Olamep',
    overview: 'Kontrola powiadomień',
    overviewSub: 'Wiadomości, rezerwacje, przypomnienia i aktualizacje w jednym miejscu.',
    activeNow: 'Aktywne',
    totalTypes: 'Łącznie typów',
    protected: 'Chronione przez Olamep',
    messages: 'Wiadomości',
    messagesSub: 'Nowe czaty i odpowiedzi od specjalistów',
    bookings: 'Rezerwacje',
    bookingsSub: 'Aktualizacje i potwierdzenia rezerwacji',
    reminders: 'Przypomnienia',
    remindersSub: 'Przypomnienia o nadchodzących wizytach',
    promotions: 'Promocje',
    promotionsSub: 'Oferty, reklamy i bonusy',
    system: 'System',
    systemSub: 'Ważne aktualizacje konta i aplikacji',
    enabled: 'Włączone',
    disabled: 'Wyłączone',
    important: 'Ważne',
    recommended: 'Zalecane',
  },
  AR: {
    title: 'الإشعارات',
    subtitle: 'اختر ما تريد استلامه من Olamep',
    overview: 'إدارة الإشعارات',
    overviewSub: 'الرسائل والحجوزات والتذكيرات وتحديثات التطبيق في مكان واحد.',
    activeNow: 'نشط',
    totalTypes: 'إجمالي الأنواع',
    protected: 'محمي بواسطة Olamep',
    messages: 'الرسائل',
    messagesSub: 'محادثات وردود جديدة من المختصين',
    bookings: 'الحجوزات',
    bookingsSub: 'تحديثات وتأكيدات الحجوزات',
    reminders: 'التذكيرات',
    remindersSub: 'تذكيرات الزيارات القادمة',
    promotions: 'العروض',
    promotionsSub: 'عروض وإعلانات ومكافآت',
    system: 'النظام',
    systemSub: 'تحديثات مهمة للحساب والتطبيق',
    enabled: 'مفعل',
    disabled: 'معطل',
    important: 'مهم',
    recommended: 'موصى به',
  },
};

function getText(language: AppLanguage) {
  return notificationTexts[language] || notificationTexts.EN;
}

function getCardAccent(key: NotificationKey) {
  if (key === 'messages') {
    return {
      iconBg: BRAND.softBlue,
      chipBg: BRAND.softBlue,
      chipColor: BRAND.blue,
      toggleOn: BRAND.blue,
      icon: '✉️',
    };
  }

  if (key === 'bookings') {
    return {
      iconBg: BRAND.softGreen,
      chipBg: BRAND.softGreen,
      chipColor: '#11883d',
      toggleOn: BRAND.green,
      icon: '📅',
    };
  }

  if (key === 'reminders') {
    return {
      iconBg: BRAND.softOrange,
      chipBg: BRAND.softOrange,
      chipColor: '#b47b00',
      toggleOn: '#f2a900',
      icon: '⏰',
    };
  }

  if (key === 'promotions') {
    return {
      iconBg: BRAND.softPink,
      chipBg: BRAND.softPink,
      chipColor: BRAND.pink,
      toggleOn: BRAND.pink,
      icon: '🎁',
    };
  }

  return {
    iconBg: BRAND.softViolet,
    chipBg: BRAND.softViolet,
    chipColor: '#7254df',
    toggleOn: '#7254df',
    icon: '🛡️',
  };
}

export default function NotificationsPage() {
  const router = useRouter();

  const [language, setLanguage] = useState<AppLanguage>(getSavedLanguage());
  const [profile, setProfile] = useState<UserProfile>(getUserProfile());

  useEffect(() => {
    const syncLanguage = () => setLanguage(getSavedLanguage());
    const syncProfile = () => setProfile(getUserProfile());

    syncLanguage();
    syncProfile();

    const unsubLanguage = subscribeToLanguageChange(setLanguage);
    const unsubProfile = subscribeToUserProfile(syncProfile);

    window.addEventListener('focus', syncLanguage);
    window.addEventListener('pageshow', syncProfile);
    window.addEventListener('storage', syncProfile);

    return () => {
      unsubLanguage();
      unsubProfile();
      window.removeEventListener('focus', syncLanguage);
      window.removeEventListener('pageshow', syncProfile);
      window.removeEventListener('storage', syncProfile);
    };
  }, []);

  const text = useMemo(() => getText(language), [language]);

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
        background: BRAND.bg,
        color: BRAND.navy,
        paddingBottom: 136,
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <div style={{ maxWidth: 430, margin: '0 auto', padding: '18px 14px 142px' }}>
        <header
          style={{
            display: 'grid',
            gridTemplateColumns: '54px 1fr 54px',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Back"
            style={{
              width: 54,
              height: 54,
              borderRadius: 999,
              border: `2.5px solid ${BRAND.border}`,
              background: '#ffffff',
              color: BRAND.navy,
              fontSize: 27,
              fontWeight: 900,
              cursor: 'pointer',
            }}
          >
            ←
          </button>

          <div style={{ textAlign: 'center' }}>
            <h1
              style={{
                margin: 0,
                fontSize: 30,
                lineHeight: 1,
                fontWeight: 900,
                letterSpacing: '-0.8px',
              }}
            >
              {text.title}
            </h1>

            <p
              style={{
                margin: '7px 0 0',
                fontSize: 13,
                lineHeight: 1.2,
                fontWeight: 800,
                color: BRAND.muted,
              }}
            >
              {text.subtitle}
            </p>
          </div>

          <button
            type="button"
            onClick={() => router.push('/profile')}
            aria-label="Close"
            style={{
              width: 54,
              height: 54,
              borderRadius: 999,
              border: `2.5px solid ${BRAND.border}`,
              background: '#ffffff',
              color: BRAND.navy,
              fontSize: 24,
              fontWeight: 900,
              cursor: 'pointer',
            }}
          >
            ×
          </button>
        </header>

        <section
          style={{
            marginTop: 20,
            borderRadius: 30,
            border: `3px solid ${BRAND.border}`,
            background:
              'linear-gradient(135deg, #ffffff 0%, #dcecff 38%, #dcffe8 72%, #fff0da 100%)',
            padding: 15,
            boxShadow: '0 12px 28px rgba(7,27,70,0.06)',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 96px',
              gap: 12,
              alignItems: 'center',
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 22,
                  lineHeight: 1.05,
                  fontWeight: 900,
                  color: BRAND.navy,
                }}
              >
                {text.overview}
              </div>

              <p
                style={{
                  margin: '8px 0 0',
                  fontSize: 13,
                  lineHeight: 1.35,
                  fontWeight: 800,
                  color: BRAND.muted,
                }}
              >
                {text.overviewSub}
              </p>
            </div>

            <div
              style={{
                minHeight: 82,
                borderRadius: 22,
                border: `2.5px solid ${BRAND.border}`,
                background: '#ffffff',
                padding: 10,
                textAlign: 'center',
                boxSizing: 'border-box',
              }}
            >
              <div
                style={{
                  fontSize: 30,
                  lineHeight: 1,
                  fontWeight: 900,
                  color: BRAND.navy,
                }}
              >
                {enabledCount}
              </div>
              <div
                style={{
                  marginTop: 8,
                  fontSize: 11,
                  lineHeight: 1.1,
                  fontWeight: 900,
                  color: BRAND.muted,
                }}
              >
                {text.activeNow}
              </div>
            </div>
          </div>

          <div
            style={{
              marginTop: 14,
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 9,
            }}
          >
            <div
              style={{
                minHeight: 64,
                borderRadius: 19,
                border: `2.5px solid ${BRAND.border}`,
                background: BRAND.softGreen,
                padding: 11,
                boxSizing: 'border-box',
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 900,
                  color: '#11883d',
                }}
              >
                🛡️ {text.protected}
              </div>
            </div>

            <div
              style={{
                minHeight: 64,
                borderRadius: 19,
                border: `2.5px solid ${BRAND.border}`,
                background: BRAND.softBlue,
                padding: 11,
                boxSizing: 'border-box',
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 900,
                  color: BRAND.blue,
                }}
              >
                {items.length} {text.totalTypes}
              </div>
            </div>
          </div>
        </section>

        <section style={{ marginTop: 18, display: 'grid', gap: 12 }}>
          {items.map((item) => {
            const enabled = profile.notificationSettings[item.key];
            const accent = getCardAccent(item.key);

            return (
              <article
                key={item.key}
                style={{
                  borderRadius: 26,
                  border: `2.5px solid ${BRAND.border}`,
                  background: '#ffffff',
                  padding: 13,
                  boxShadow: '0 8px 20px rgba(7,27,70,0.05)',
                }}
              >
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '58px minmax(0, 1fr) auto',
                    alignItems: 'center',
                    gap: 12,
                  }}
                >
                  <div
                    style={{
                      width: 58,
                      height: 58,
                      borderRadius: 18,
                      background: accent.iconBg,
                      border: `2.5px solid ${BRAND.border}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 27,
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
                        gap: 7,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 17,
                          lineHeight: 1.1,
                          fontWeight: 900,
                          color: BRAND.navy,
                        }}
                      >
                        {item.title}
                      </div>

                      <span
                        style={{
                          minHeight: 26,
                          padding: '0 9px',
                          borderRadius: 999,
                          background: accent.chipBg,
                          color: accent.chipColor,
                          border: `2px solid ${BRAND.border}`,
                          fontSize: 10.5,
                          fontWeight: 900,
                          display: 'inline-flex',
                          alignItems: 'center',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {item.badge}
                      </span>
                    </div>

                    <p
                      style={{
                        margin: '6px 0 0',
                        fontSize: 13,
                        lineHeight: 1.3,
                        color: BRAND.muted,
                        fontWeight: 800,
                      }}
                    >
                      {item.subtitle}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleSetting(item.key)}
                    aria-label={enabled ? text.enabled : text.disabled}
                    style={{
                      position: 'relative',
                      width: 68,
                      height: 40,
                      borderRadius: 999,
                      border: `2.5px solid ${BRAND.border}`,
                      background: enabled ? accent.toggleOn : '#e5e7eb',
                      cursor: 'pointer',
                      flexShrink: 0,
                    }}
                  >
                    <span
                      style={{
                        position: 'absolute',
                        top: 4,
                        left: enabled ? 32 : 4,
                        width: 26,
                        height: 26,
                        borderRadius: 999,
                        background: '#ffffff',
                        border: `2px solid ${BRAND.border}`,
                        transition: 'all 0.2s ease',
                      }}
                    />
                  </button>
                </div>

                <div
                  style={{
                    marginTop: 12,
                    borderRadius: 18,
                    background: enabled ? BRAND.softGreen : '#f2f4f7',
                    border: `2px solid ${BRAND.border}`,
                    padding: '10px 12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 10,
                    alignItems: 'center',
                  }}
                >
                  <div
                    style={{
                      fontSize: 13,
                      color: BRAND.muted,
                      fontWeight: 900,
                    }}
                  >
                    {enabled ? text.enabled : text.disabled}
                  </div>

                  <span
                    style={{
                      minHeight: 28,
                      padding: '0 10px',
                      borderRadius: 999,
                      background: enabled ? '#ffffff' : '#ffffff',
                      color: enabled ? '#11883d' : BRAND.muted,
                      border: `2px solid ${BRAND.border}`,
                      fontSize: 11,
                      fontWeight: 900,
                      display: 'inline-flex',
                      alignItems: 'center',
                    }}
                  >
                    {enabled ? text.enabled : text.disabled}
                  </span>
                </div>
              </article>
            );
          })}
        </section>
      </div>

      <BottomNav active="profile" />
    </main>
  );
}
