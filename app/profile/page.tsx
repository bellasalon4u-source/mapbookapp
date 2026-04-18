'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import BottomNav from '../../components/common/BottomNav';
import {
  getSavedLanguage,
  subscribeToLanguageChange,
  type AppLanguage,
} from '../../services/i18n';
import {
  getUserProfile,
  subscribeToUserProfile,
  type UserProfile,
} from '../services/userProfileStore';

type ProfileTexts = {
  title: string;
  subtitle: string;
  bonusesTitle: string;
  welcomeBonus: string;
  referralBookings: string;
  invite: string;
  verified: string;
  editProfile: string;
  upcomingBookings: string;
  savedMasters: string;
  payments: string;
  notifications: string;
  languageRegion: string;
  settings: string;
  legal: string;
  help: string;
};

const texts: Record<AppLanguage, ProfileTexts> = {
  EN: {
    title: 'Profile',
    subtitle: 'Manage your account, bookings and settings',
    bonusesTitle: 'Your bonuses',
    welcomeBonus: 'Welcome Bonus',
    referralBookings: 'Referral free bookings',
    invite: 'Invite',
    verified: 'Account verified',
    editProfile: 'Edit profile',
    upcomingBookings: 'Upcoming bookings',
    savedMasters: 'Saved masters',
    payments: 'Payment methods',
    notifications: 'Notifications',
    languageRegion: 'Language & region',
    settings: 'Settings',
    legal: 'Legal',
    help: 'Help',
  },
  ES: {
    title: 'Perfil',
    subtitle: 'Administra tu cuenta, reservas y ajustes',
    bonusesTitle: 'Tus bonos',
    welcomeBonus: 'Bono de bienvenida',
    referralBookings: 'Reservas gratis por referidos',
    invite: 'Invitar',
    verified: 'Cuenta verificada',
    editProfile: 'Editar perfil',
    upcomingBookings: 'Próximas reservas',
    savedMasters: 'Profesionales guardados',
    payments: 'Métodos de pago',
    notifications: 'Notificaciones',
    languageRegion: 'Idioma y región',
    settings: 'Ajustes',
    legal: 'Legal',
    help: 'Ayuda',
  },
  RU: {
    title: 'Профиль',
    subtitle: 'Управляйте аккаунтом, бронированиями и настройками',
    bonusesTitle: 'Ваши бонусы',
    welcomeBonus: 'Welcome Bonus',
    referralBookings: 'Реферальные бронирования',
    invite: 'Пригласить',
    verified: 'Аккаунт подтверждён',
    editProfile: 'Редактировать профиль',
    upcomingBookings: 'Предстоящие бронирования',
    savedMasters: 'Сохранённые мастера',
    payments: 'Способы оплаты',
    notifications: 'Уведомления',
    languageRegion: 'Язык и регион',
    settings: 'Настройки',
    legal: 'Правовая информация',
    help: 'Помощь',
  },
  CZ: {
    title: 'Profil',
    subtitle: 'Spravujte svůj účet, rezervace a nastavení',
    bonusesTitle: 'Vaše bonusy',
    welcomeBonus: 'Welcome Bonus',
    referralBookings: 'Doporučené rezervace zdarma',
    invite: 'Pozvat',
    verified: 'Účet ověřen',
    editProfile: 'Upravit profil',
    upcomingBookings: 'Nadcházející rezervace',
    savedMasters: 'Uložení specialisté',
    payments: 'Platební metody',
    notifications: 'Oznámení',
    languageRegion: 'Jazyk a region',
    settings: 'Nastavení',
    legal: 'Právní informace',
    help: 'Pomoc',
  },
  DE: {
    title: 'Profil',
    subtitle: 'Verwalte dein Konto, Buchungen und Einstellungen',
    bonusesTitle: 'Deine Boni',
    welcomeBonus: 'Welcome Bonus',
    referralBookings: 'Kostenlose Empfehlungsbuchungen',
    invite: 'Einladen',
    verified: 'Konto verifiziert',
    editProfile: 'Profil bearbeiten',
    upcomingBookings: 'Bevorstehende Buchungen',
    savedMasters: 'Gespeicherte Profis',
    payments: 'Zahlungsmethoden',
    notifications: 'Benachrichtigungen',
    languageRegion: 'Sprache & Region',
    settings: 'Einstellungen',
    legal: 'Rechtliches',
    help: 'Hilfe',
  },
  PL: {
    title: 'Profil',
    subtitle: 'Zarządzaj kontem, rezerwacjami i ustawieniami',
    bonusesTitle: 'Twoje bonusy',
    welcomeBonus: 'Welcome Bonus',
    referralBookings: 'Darmowe rezerwacje z poleceń',
    invite: 'Zaproś',
    verified: 'Konto zweryfikowane',
    editProfile: 'Edytuj profil',
    upcomingBookings: 'Nadchodzące rezerwacje',
    savedMasters: 'Zapisani specjaliści',
    payments: 'Metody płatności',
    notifications: 'Powiadomienia',
    languageRegion: 'Język i region',
    settings: 'Ustawienia',
    legal: 'Informacje prawne',
    help: 'Pomoc',
  },
};

type ActionItem = {
  id: string;
  label: string;
  route: string;
  icon: string;
};

function getText(language: AppLanguage) {
  return texts[language] || texts.EN;
}

function MenuRow({
  icon,
  label,
  onClick,
}: {
  icon: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: '100%',
        minHeight: 72,
        border: '1px solid #e9e1d6',
        borderRadius: 22,
        background: '#ffffff',
        display: 'grid',
        gridTemplateColumns: '46px 1fr auto',
        alignItems: 'center',
        gap: 14,
        padding: '0 16px',
        textAlign: 'left',
        cursor: 'pointer',
        boxShadow: '0 4px 14px rgba(0,0,0,0.04)',
      }}
    >
      <div
        style={{
          width: 46,
          height: 46,
          borderRadius: 16,
          background: '#f7f3eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 22,
        }}
      >
        {icon}
      </div>

      <div
        style={{
          fontSize: 16,
          fontWeight: 900,
          color: '#17130f',
          lineHeight: 1.2,
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontSize: 22,
          fontWeight: 900,
          color: '#8a8177',
        }}
      >
        ›
      </div>
    </button>
  );
}

export default function ProfilePage() {
  const router = useRouter();

  const [language, setLanguage] = useState<AppLanguage>(getSavedLanguage());
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

    const unsubscribeLanguage = subscribeToLanguageChange((nextLanguage) => {
      setLanguage(nextLanguage);
    });
    const unsubscribeProfile = subscribeToUserProfile(syncProfile);

    window.addEventListener('focus', syncLanguage);

    return () => {
      unsubscribeLanguage();
      unsubscribeProfile();
      window.removeEventListener('focus', syncLanguage);
    };
  }, []);

  const text = useMemo(() => getText(language), [language]);

  const actionItems: ActionItem[] = [
    {
      id: 'payments',
      label: text.payments,
      route: '/profile/payments',
      icon: '💳',
    },
    {
      id: 'notifications',
      label: text.notifications,
      route: '/profile/notifications',
      icon: '🔔',
    },
    {
      id: 'language-region',
      label: text.languageRegion,
      route: '/profile/language-region',
      icon: '🌍',
    },
    {
      id: 'settings',
      label: text.settings,
      route: '/profile/settings',
      icon: '⚙️',
    },
    {
      id: 'legal',
      label: text.legal,
      route: '/profile/legal',
      icon: '⚖️',
    },
    {
      id: 'help',
      label: text.help,
      route: '/profile/help',
      icon: '💬',
    },
  ];

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#f7f3eb',
        color: '#17130f',
        paddingBottom: 110,
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <div style={{ maxWidth: 430, margin: '0 auto', padding: '20px 16px 110px' }}>
        <section
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            gap: 12,
            alignItems: 'start',
            marginBottom: 18,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 34,
                fontWeight: 900,
                lineHeight: 1.05,
                color: '#17130f',
              }}
            >
              {text.title}
            </div>

            <div
              style={{
                marginTop: 6,
                fontSize: 14,
                lineHeight: 1.45,
                color: '#7b7268',
                fontWeight: 700,
                maxWidth: 250,
              }}
            >
              {text.subtitle}
            </div>
          </div>

          <button
            type="button"
            onClick={() => router.push('/profile/settings')}
            style={{
              width: 62,
              height: 62,
              borderRadius: 999,
              border: 'none',
              background: '#fff',
              boxShadow: '0 4px 14px rgba(0,0,0,0.05)',
              fontSize: 28,
              cursor: 'pointer',
            }}
          >
            ⚙️
          </button>
        </section>

        <section
          style={{
            background: '#ffffff',
            borderRadius: 30,
            border: '1px solid #ece3d8',
            boxShadow: '0 6px 20px rgba(0,0,0,0.04)',
            padding: 18,
            marginBottom: 18,
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr auto',
              gap: 12,
              alignItems: 'start',
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 900,
                  color: '#17130f',
                }}
              >
                {text.bonusesTitle}
              </div>

              <div
                style={{
                  marginTop: 14,
                  fontSize: 15,
                  lineHeight: 1.45,
                  color: '#6f675f',
                  fontWeight: 700,
                }}
              >
                {text.welcomeBonus}: <strong style={{ color: '#17130f' }}>£5.00</strong>
              </div>

              <div
                style={{
                  marginTop: 8,
                  fontSize: 15,
                  lineHeight: 1.45,
                  color: '#6f675f',
                  fontWeight: 700,
                }}
              >
                {text.referralBookings}: <strong style={{ color: '#17130f' }}>3</strong>
              </div>
            </div>

            <button
              type="button"
              onClick={() => router.push('/profile/invite')}
              style={{
                minWidth: 102,
                height: 56,
                borderRadius: 20,
                border: 'none',
                background: '#2f241c',
                color: '#fff',
                fontSize: 16,
                fontWeight: 900,
                padding: '0 18px',
                cursor: 'pointer',
              }}
            >
              {text.invite}
            </button>
          </div>
        </section>

        <section
          style={{
            background: '#ffffff',
            borderRadius: 34,
            border: '1px solid #ece3d8',
            boxShadow: '0 6px 20px rgba(0,0,0,0.04)',
            padding: 18,
            marginBottom: 18,
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '110px 1fr',
              gap: 16,
              alignItems: 'center',
            }}
          >
            <img
              src={
                profile.avatar ||
                'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=500&q=80'
              }
              alt={profile.fullName}
              style={{
                width: 110,
                height: 110,
                objectFit: 'cover',
                borderRadius: 28,
                display: 'block',
                background: '#f3ede4',
              }}
            />

            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: 22,
                  lineHeight: 1.15,
                  fontWeight: 900,
                  color: '#17130f',
                  wordBreak: 'break-word',
                }}
              >
                {profile.fullName}
              </div>

              <div
                style={{
                  marginTop: 8,
                  fontSize: 15,
                  lineHeight: 1.45,
                  color: '#7b7268',
                  fontWeight: 700,
                  wordBreak: 'break-word',
                }}
              >
                {profile.email}
              </div>

              <div
                style={{
                  marginTop: 4,
                  fontSize: 15,
                  lineHeight: 1.45,
                  color: '#7b7268',
                  fontWeight: 700,
                }}
              >
                {profile.phone}
              </div>

              <div
                style={{
                  marginTop: 4,
                  fontSize: 15,
                  lineHeight: 1.45,
                  color: '#7b7268',
                  fontWeight: 700,
                }}
              >
                {profile.region}
              </div>

              <div
                style={{
                  marginTop: 12,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  minHeight: 42,
                  padding: '0 16px',
                  borderRadius: 999,
                  background: '#f7f3eb',
                  color: '#4a443c',
                  fontSize: 14,
                  fontWeight: 900,
                }}
              >
                <span style={{ fontSize: 18 }}>🛡️</span>
                {text.verified}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => router.push('/profile/edit')}
            style={{
              marginTop: 18,
              width: '100%',
              minHeight: 58,
              borderRadius: 22,
              border: 'none',
              background: '#2f241c',
              color: '#fff',
              fontSize: 18,
              fontWeight: 900,
              cursor: 'pointer',
            }}
          >
            {text.editProfile}
          </button>
        </section>

        <section
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 14,
            marginBottom: 18,
          }}
        >
          <button
            type="button"
            onClick={() => router.push('/profile/bookings')}
            style={{
              minHeight: 132,
              borderRadius: 28,
              border: 'none',
              background: '#2f241c',
              color: '#fff',
              padding: 18,
              textAlign: 'left',
              cursor: 'pointer',
              boxShadow: '0 6px 20px rgba(0,0,0,0.05)',
            }}
          >
            <div
              style={{
                fontSize: 15,
                lineHeight: 1.35,
                fontWeight: 700,
                color: '#e8ddd0',
                maxWidth: 110,
              }}
            >
              {text.upcomingBookings}
            </div>

            <div
              style={{
                marginTop: 18,
                fontSize: 58,
                lineHeight: 1,
                fontWeight: 900,
                color: '#fff',
              }}
            >
              3
            </div>
          </button>

          <button
            type="button"
            onClick={() => router.push('/profile/saved-masters')}
            style={{
              minHeight: 132,
              borderRadius: 28,
              border: 'none',
              background: '#efe6da',
              color: '#17130f',
              padding: 18,
              textAlign: 'left',
              cursor: 'pointer',
              boxShadow: '0 6px 20px rgba(0,0,0,0.05)',
            }}
          >
            <div
              style={{
                fontSize: 15,
                lineHeight: 1.35,
                fontWeight: 700,
                color: '#7b7268',
                maxWidth: 120,
              }}
            >
              {text.savedMasters}
            </div>

            <div
              style={{
                marginTop: 18,
                fontSize: 58,
                lineHeight: 1,
                fontWeight: 900,
                color: '#17130f',
              }}
            >
              8
            </div>
          </button>
        </section>

        <section style={{ display: 'grid', gap: 12 }}>
          {actionItems.map((item) => (
            <MenuRow
              key={item.id}
              icon={item.icon}
              label={item.label}
              onClick={() => router.push(item.route)}
            />
          ))}
        </section>
      </div>

      <BottomNav active="profile" />
    </main>
  );
}
