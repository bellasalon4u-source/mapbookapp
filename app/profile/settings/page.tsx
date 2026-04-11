'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import BottomNav from '../../../components/common/BottomNav';
import { getSavedLanguage, type AppLanguage } from '../../../services/i18n';
import {
  getUserProfile,
  subscribeToUserProfile,
  type UserProfile,
} from '../../services/userProfileStore';

const settingsTexts = {
  EN: {
    title: 'Account settings',
    subtitle: 'Privacy, security, legal information and account actions',
    profileSection: 'Your account',
    personal: 'Personal details',
    personalSub: 'Name, email, phone and profile information',
    privacy: 'Privacy',
    privacySub: 'Profile visibility and contact safety',
    security: 'Security',
    securitySub: 'Password, sign-in and protection',
    legal: 'Legal information',
    legalSub: 'Terms, privacy policy and platform rules',
    languageRegion: 'Language & region',
    languageRegionSub: 'App language, country, currency and location mode',
    notifications: 'Notifications',
    notificationsSub: 'Bookings, messages and system alerts',
    payments: 'Payments & wallet',
    paymentsSub: 'Cards, balance, refunds and payout settings',
    deleteAccount: 'Delete account',
    deleteAccountSub: 'Permanently remove your profile',
    logout: 'Log out',
    logoutSub: 'Sign out from your current session',
    verified: 'Verified',
    status: 'Secure account',
    dangerZone: 'Danger zone',
    comingSoonPrivacy: 'Privacy settings coming soon',
    comingSoonSecurity: 'Security settings coming soon',
    comingSoonDelete: 'Delete account flow coming soon',
  },
  ES: {
    title: 'Configuración de la cuenta',
    subtitle: 'Privacidad, seguridad, información legal y acciones de cuenta',
    profileSection: 'Tu cuenta',
    personal: 'Datos personales',
    personalSub: 'Nombre, email, teléfono e información del perfil',
    privacy: 'Privacidad',
    privacySub: 'Visibilidad del perfil y seguridad del contacto',
    security: 'Seguridad',
    securitySub: 'Contraseña, acceso y protección',
    legal: 'Información legal',
    legalSub: 'Términos, privacidad y reglas de la plataforma',
    languageRegion: 'Idioma y región',
    languageRegionSub: 'Idioma de la app, país, moneda y ubicación',
    notifications: 'Notificaciones',
    notificationsSub: 'Reservas, mensajes y alertas del sistema',
    payments: 'Pagos y billetera',
    paymentsSub: 'Tarjetas, saldo, reembolsos y pagos',
    deleteAccount: 'Eliminar cuenta',
    deleteAccountSub: 'Eliminar permanentemente tu perfil',
    logout: 'Cerrar sesión',
    logoutSub: 'Salir de la sesión actual',
    verified: 'Verificado',
    status: 'Cuenta segura',
    dangerZone: 'Zona de riesgo',
    comingSoonPrivacy: 'La configuración de privacidad llegará pronto',
    comingSoonSecurity: 'La configuración de seguridad llegará pronto',
    comingSoonDelete: 'El flujo para eliminar la cuenta llegará pronto',
  },
  RU: {
    title: 'Настройки аккаунта',
    subtitle: 'Приватность, безопасность, юридическая информация и действия аккаунта',
    profileSection: 'Ваш аккаунт',
    personal: 'Личные данные',
    personalSub: 'Имя, email, телефон и данные профиля',
    privacy: 'Приватность',
    privacySub: 'Видимость профиля и безопасность контактов',
    security: 'Безопасность',
    securitySub: 'Пароль, вход и защита аккаунта',
    legal: 'Юридическая информация',
    legalSub: 'Условия, приватность и правила платформы',
    languageRegion: 'Язык и регион',
    languageRegionSub: 'Язык приложения, страна, валюта и локация',
    notifications: 'Уведомления',
    notificationsSub: 'Бронирования, сообщения и системные оповещения',
    payments: 'Платежи и кошелёк',
    paymentsSub: 'Карты, баланс, возвраты и настройки выплат',
    deleteAccount: 'Удалить аккаунт',
    deleteAccountSub: 'Полностью удалить ваш профиль',
    logout: 'Выйти из аккаунта',
    logoutSub: 'Завершить текущую сессию',
    verified: 'Проверено',
    status: 'Аккаунт защищён',
    dangerZone: 'Опасная зона',
    comingSoonPrivacy: 'Настройки приватности скоро появятся',
    comingSoonSecurity: 'Настройки безопасности скоро появятся',
    comingSoonDelete: 'Функция удаления аккаунта скоро появится',
  },
  CZ: {
    title: 'Nastavení účtu',
    subtitle: 'Soukromí, zabezpečení, právní informace a akce účtu',
    profileSection: 'Váš účet',
    personal: 'Osobní údaje',
    personalSub: 'Jméno, email, telefon a údaje profilu',
    privacy: 'Soukromí',
    privacySub: 'Viditelnost profilu a bezpečnost kontaktu',
    security: 'Zabezpečení',
    securitySub: 'Heslo, přihlášení a ochrana',
    legal: 'Právní informace',
    legalSub: 'Podmínky, soukromí a pravidla platformy',
    languageRegion: 'Jazyk a region',
    languageRegionSub: 'Jazyk aplikace, země, měna a poloha',
    notifications: 'Oznámení',
    notificationsSub: 'Rezervace, zprávy a systémová upozornění',
    payments: 'Platby a peněženka',
    paymentsSub: 'Karty, zůstatek, refundy a výplaty',
    deleteAccount: 'Smazat účet',
    deleteAccountSub: 'Trvale odstranit váš profil',
    logout: 'Odhlásit se',
    logoutSub: 'Odhlásit aktuální relaci',
    verified: 'Ověřeno',
    status: 'Bezpečný účet',
    dangerZone: 'Riziková zóna',
    comingSoonPrivacy: 'Nastavení soukromí již brzy',
    comingSoonSecurity: 'Nastavení zabezpečení již brzy',
    comingSoonDelete: 'Odstranění účtu již brzy',
  },
  DE: {
    title: 'Kontoeinstellungen',
    subtitle: 'Datenschutz, Sicherheit, rechtliche Infos und Kontoaktionen',
    profileSection: 'Dein Konto',
    personal: 'Persönliche Daten',
    personalSub: 'Name, E-Mail, Telefon und Profilinformationen',
    privacy: 'Datenschutz',
    privacySub: 'Profilsichtbarkeit und Kontaktsicherheit',
    security: 'Sicherheit',
    securitySub: 'Passwort, Anmeldung und Schutz',
    legal: 'Rechtliche Informationen',
    legalSub: 'AGB, Datenschutz und Plattformregeln',
    languageRegion: 'Sprache & Region',
    languageRegionSub: 'App-Sprache, Land, Währung und Standort',
    notifications: 'Benachrichtigungen',
    notificationsSub: 'Buchungen, Nachrichten und Systemhinweise',
    payments: 'Zahlungen & Wallet',
    paymentsSub: 'Karten, Guthaben, Rückerstattungen und Auszahlungen',
    deleteAccount: 'Konto löschen',
    deleteAccountSub: 'Dein Profil dauerhaft löschen',
    logout: 'Abmelden',
    logoutSub: 'Aktuelle Sitzung beenden',
    verified: 'Verifiziert',
    status: 'Geschütztes Konto',
    dangerZone: 'Gefahrenbereich',
    comingSoonPrivacy: 'Datenschutzeinstellungen folgen bald',
    comingSoonSecurity: 'Sicherheitseinstellungen folgen bald',
    comingSoonDelete: 'Kontolöschung folgt bald',
  },
  PL: {
    title: 'Ustawienia konta',
    subtitle: 'Prywatność, bezpieczeństwo, informacje prawne i działania konta',
    profileSection: 'Twoje konto',
    personal: 'Dane osobowe',
    personalSub: 'Imię, email, telefon i dane profilu',
    privacy: 'Prywatność',
    privacySub: 'Widoczność profilu i bezpieczeństwo kontaktu',
    security: 'Bezpieczeństwo',
    securitySub: 'Hasło, logowanie i ochrona',
    legal: 'Informacje prawne',
    legalSub: 'Warunki, prywatność i zasady platformy',
    languageRegion: 'Język i region',
    languageRegionSub: 'Język aplikacji, kraj, waluta i lokalizacja',
    notifications: 'Powiadomienia',
    notificationsSub: 'Rezerwacje, wiadomości i alerty systemowe',
    payments: 'Płatności i portfel',
    paymentsSub: 'Karty, saldo, zwroty i ustawienia wypłat',
    deleteAccount: 'Usuń konto',
    deleteAccountSub: 'Trwale usuń swój profil',
    logout: 'Wyloguj się',
    logoutSub: 'Zakończ bieżącą sesję',
    verified: 'Zweryfikowano',
    status: 'Bezpieczne konto',
    dangerZone: 'Strefa ryzyka',
    comingSoonPrivacy: 'Ustawienia prywatności już wkrótce',
    comingSoonSecurity: 'Ustawienia bezpieczeństwa już wkrótce',
    comingSoonDelete: 'Usuwanie konta już wkrótce',
  },
} as const;

type SettingsItem = {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  accent: 'pink' | 'green' | 'blue' | 'violet' | 'orange' | 'danger' | 'neutral';
  onClick: () => void;
};

function accentStyles(accent: SettingsItem['accent']) {
  if (accent === 'pink') return { background: '#fff1f7', color: '#ff4fa0' };
  if (accent === 'green') return { background: '#eef9f1', color: '#2fa35a' };
  if (accent === 'blue') return { background: '#eef4ff', color: '#2f7cf6' };
  if (accent === 'violet') return { background: '#f3efff', color: '#7a5af8' };
  if (accent === 'orange') return { background: '#fff5e8', color: '#d68612' };
  if (accent === 'danger') return { background: '#fff1f1', color: '#ef4444' };
  return { background: '#f4efe8', color: '#6d6258' };
}

export default function AccountSettingsPage() {
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
    () => settingsTexts[language as keyof typeof settingsTexts] || settingsTexts.EN,
    [language]
  );

  const mainItems: SettingsItem[] = [
    {
      id: 'personal',
      title: text.personal,
      subtitle: text.personalSub,
      icon: '👤',
      accent: 'blue',
      onClick: () => router.push('/profile/edit'),
    },
    {
      id: 'language-region',
      title: text.languageRegion,
      subtitle: text.languageRegionSub,
      icon: '🌍',
      accent: 'orange',
      onClick: () => router.push('/profile/language-region'),
    },
    {
      id: 'notifications',
      title: text.notifications,
      subtitle: text.notificationsSub,
      icon: '🔔',
      accent: 'pink',
      onClick: () => router.push('/profile/notifications'),
    },
    {
      id: 'payments',
      title: text.payments,
      subtitle: text.paymentsSub,
      icon: '💳',
      accent: 'green',
      onClick: () => router.push('/profile/payments'),
    },
    {
      id: 'privacy',
      title: text.privacy,
      subtitle: text.privacySub,
      icon: '🔒',
      accent: 'green',
      onClick: () => alert(text.comingSoonPrivacy),
    },
    {
      id: 'security',
      title: text.security,
      subtitle: text.securitySub,
      icon: '🛡️',
      accent: 'violet',
      onClick: () => alert(text.comingSoonSecurity),
    },
    {
      id: 'legal',
      title: text.legal,
      subtitle: text.legalSub,
      icon: '⚖️',
      accent: 'blue',
      onClick: () => router.push('/profile/legal'),
    },
  ];

  const dangerItems: SettingsItem[] = [
    {
      id: 'delete',
      title: text.deleteAccount,
      subtitle: text.deleteAccountSub,
      icon: '🗑️',
      accent: 'danger',
      onClick: () => alert(text.comingSoonDelete),
    },
    {
      id: 'logout',
      title: text.logout,
      subtitle: text.logoutSub,
      icon: '⎋',
      accent: 'danger',
      onClick: () => router.push('/'),
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

        <div
          style={{
            marginTop: 18,
            borderRadius: 32,
            border: '1px solid #efe4d7',
            background: '#fff',
            padding: 18,
            boxShadow: '0 12px 28px rgba(44, 23, 10, 0.05)',
          }}
        >
          <div
            style={{
              fontSize: 16,
              fontWeight: 900,
              color: '#17130f',
              marginBottom: 14,
            }}
          >
            {text.profileSection}
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '72px 1fr',
              gap: 14,
              alignItems: 'center',
            }}
          >
            <img
              src={profile.avatar}
              alt={profile.fullName}
              style={{
                width: 72,
                height: 72,
                borderRadius: 24,
                objectFit: 'cover',
                display: 'block',
                boxShadow: '0 10px 22px rgba(44, 23, 10, 0.10)',
              }}
            />

            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 900,
                  color: '#17130f',
                  lineHeight: 1.1,
                }}
              >
                {profile.fullName}
              </div>

              <div
                style={{
                  marginTop: 6,
                  fontSize: 14,
                  color: '#7b7268',
                  fontWeight: 700,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {profile.email}
              </div>

              <div
                style={{
                  marginTop: 10,
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 8,
                }}
              >
                <span
                  style={{
                    borderRadius: 999,
                    padding: '8px 12px',
                    background: '#eef9f1',
                    color: '#2fa35a',
                    fontSize: 12,
                    fontWeight: 900,
                  }}
                >
                  {text.status}
                </span>

                {profile.isVerified ? (
                  <span
                    style={{
                      borderRadius: 999,
                      padding: '8px 12px',
                      background: '#eef4ff',
                      color: '#2f7cf6',
                      fontSize: 12,
                      fontWeight: 900,
                    }}
                  >
                    {text.verified}
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: 18,
            overflow: 'hidden',
            borderRadius: 30,
            border: '1px solid #efe4d7',
            background: '#fff',
            boxShadow: '0 12px 28px rgba(44, 23, 10, 0.05)',
          }}
        >
          {mainItems.map((item, index) => {
            const accent = accentStyles(item.accent);

            return (
              <button
                key={item.id}
                type="button"
                onClick={item.onClick}
                style={{
                  width: '100%',
                  display: 'grid',
                  gridTemplateColumns: '46px 1fr auto',
                  gap: 14,
                  alignItems: 'center',
                  padding: '16px 18px',
                  textAlign: 'left',
                  border: 'none',
                  borderTop: index !== 0 ? '1px solid #f4eadf' : 'none',
                  background: '#fff',
                  cursor: 'pointer',
                }}
              >
                <div
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: 16,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 20,
                    ...accent,
                  }}
                >
                  {item.icon}
                </div>

                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 15,
                      fontWeight: 900,
                      color: '#17130f',
                    }}
                  >
                    {item.title}
                  </div>

                  <div
                    style={{
                      marginTop: 4,
                      fontSize: 13,
                      lineHeight: 1.45,
                      color: '#7b7268',
                      fontWeight: 700,
                    }}
                  >
                    {item.subtitle}
                  </div>
                </div>

                <span
                  style={{
                    fontSize: 20,
                    color: '#938475',
                    fontWeight: 900,
                  }}
                >
                  ›
                </span>
              </button>
            );
          })}
        </div>

        <div
          style={{
            marginTop: 18,
            borderRadius: 30,
            border: '1px solid #f2dede',
            background: '#fff',
            padding: 16,
            boxShadow: '0 12px 28px rgba(44, 23, 10, 0.05)',
          }}
        >
          <div
            style={{
              fontSize: 16,
              fontWeight: 900,
              color: '#ef4444',
              marginBottom: 12,
            }}
          >
            {text.dangerZone}
          </div>

          <div style={{ display: 'grid', gap: 10 }}>
            {dangerItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={item.onClick}
                style={{
                  width: '100%',
                  display: 'grid',
                  gridTemplateColumns: '46px 1fr auto',
                  gap: 14,
                  alignItems: 'center',
                  padding: '14px 16px',
                  textAlign: 'left',
                  border: '1px solid #f4dede',
                  borderRadius: 22,
                  background: '#fff8f8',
                  cursor: 'pointer',
                }}
              >
                <div
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: 16,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 20,
                    background: '#fff1f1',
                    color: '#ef4444',
                  }}
                >
                  {item.icon}
                </div>

                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 15,
                      fontWeight: 900,
                      color: '#ef4444',
                    }}
                  >
                    {item.title}
                  </div>

                  <div
                    style={{
                      marginTop: 4,
                      fontSize: 13,
                      lineHeight: 1.45,
                      color: '#b66161',
                      fontWeight: 700,
                    }}
                  >
                    {item.subtitle}
                  </div>
                </div>

                <span
                  style={{
                    fontSize: 20,
                    color: '#ef4444',
                    fontWeight: 900,
                  }}
                >
                  ›
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <BottomNav active="profile" />
    </main>
  );
}
