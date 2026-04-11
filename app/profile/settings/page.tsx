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
    personal: 'Personal details',
    personalSub: 'Name, email, phone and profile information',
    privacy: 'Privacy',
    privacySub: 'Profile visibility and contact safety',
    security: 'Security',
    securitySub: 'Password, sign-in and protection',
    legal: 'Legal information',
    legalSub: 'Terms, privacy policy and platform rules',
    deleteAccount: 'Delete account',
    deleteAccountSub: 'Permanently remove your profile',
    logout: 'Log out',
    profileSection: 'Your account',
    verified: 'Verified',
    status: 'Secure account',
    dangerZone: 'Danger zone',
    comingSoonPrivacy: 'Privacy settings coming soon',
    comingSoonSecurity: 'Security settings coming soon',
    comingSoonDelete: 'Delete account flow coming soon',
    accountOverview: 'Account overview',
    quickControls: 'Quick controls',
    protected: 'Protected profile',
  },
  ES: {
    title: 'Configuración de la cuenta',
    subtitle: 'Privacidad, seguridad, información legal y acciones de cuenta',
    personal: 'Datos personales',
    personalSub: 'Nombre, email, teléfono e información del perfil',
    privacy: 'Privacidad',
    privacySub: 'Visibilidad del perfil y seguridad del contacto',
    security: 'Seguridad',
    securitySub: 'Contraseña, acceso y protección',
    legal: 'Información legal',
    legalSub: 'Términos, privacidad y reglas de la plataforma',
    deleteAccount: 'Eliminar cuenta',
    deleteAccountSub: 'Eliminar permanentemente tu perfil',
    logout: 'Cerrar sesión',
    profileSection: 'Tu cuenta',
    verified: 'Verificado',
    status: 'Cuenta segura',
    dangerZone: 'Zona de riesgo',
    comingSoonPrivacy: 'La configuración de privacidad llegará pronto',
    comingSoonSecurity: 'La configuración de seguridad llegará pronto',
    comingSoonDelete: 'El flujo para eliminar la cuenta llegará pronto',
    accountOverview: 'Resumen de la cuenta',
    quickControls: 'Controles rápidos',
    protected: 'Perfil protegido',
  },
  RU: {
    title: 'Настройки аккаунта',
    subtitle: 'Приватность, безопасность, юридическая информация и действия аккаунта',
    personal: 'Личные данные',
    personalSub: 'Имя, email, телефон и данные профиля',
    privacy: 'Приватность',
    privacySub: 'Видимость профиля и безопасность контактов',
    security: 'Безопасность',
    securitySub: 'Пароль, вход и защита аккаунта',
    legal: 'Юридическая информация',
    legalSub: 'Условия, приватность и правила платформы',
    deleteAccount: 'Удалить аккаунт',
    deleteAccountSub: 'Полностью удалить ваш профиль',
    logout: 'Выйти из аккаунта',
    profileSection: 'Ваш аккаунт',
    verified: 'Проверено',
    status: 'Аккаунт защищён',
    dangerZone: 'Опасная зона',
    comingSoonPrivacy: 'Настройки приватности скоро появятся',
    comingSoonSecurity: 'Настройки безопасности скоро появятся',
    comingSoonDelete: 'Функция удаления аккаунта скоро появится',
    accountOverview: 'Обзор аккаунта',
    quickControls: 'Быстрые настройки',
    protected: 'Профиль защищён',
  },
  CZ: {
    title: 'Nastavení účtu',
    subtitle: 'Soukromí, zabezpečení, právní informace a akce účtu',
    personal: 'Osobní údaje',
    personalSub: 'Jméno, email, telefon a údaje profilu',
    privacy: 'Soukromí',
    privacySub: 'Viditelnost profilu a bezpečnost kontaktu',
    security: 'Zabezpečení',
    securitySub: 'Heslo, přihlášení a ochrana',
    legal: 'Právní informace',
    legalSub: 'Podmínky, soukromí a pravidla platformy',
    deleteAccount: 'Smazat účet',
    deleteAccountSub: 'Trvale odstranit váš profil',
    logout: 'Odhlásit se',
    profileSection: 'Váš účet',
    verified: 'Ověřeno',
    status: 'Bezpečný účet',
    dangerZone: 'Riziková zóna',
    comingSoonPrivacy: 'Nastavení soukromí již brzy',
    comingSoonSecurity: 'Nastavení zabezpečení již brzy',
    comingSoonDelete: 'Odstranění účtu již brzy',
    accountOverview: 'Přehled účtu',
    quickControls: 'Rychlé ovládání',
    protected: 'Chráněný profil',
  },
  DE: {
    title: 'Kontoeinstellungen',
    subtitle: 'Datenschutz, Sicherheit, rechtliche Infos und Kontoaktionen',
    personal: 'Persönliche Daten',
    personalSub: 'Name, E-Mail, Telefon und Profilinformationen',
    privacy: 'Datenschutz',
    privacySub: 'Profilsichtbarkeit und Kontaktsicherheit',
    security: 'Sicherheit',
    securitySub: 'Passwort, Anmeldung und Schutz',
    legal: 'Rechtliche Informationen',
    legalSub: 'AGB, Datenschutz und Plattformregeln',
    deleteAccount: 'Konto löschen',
    deleteAccountSub: 'Dein Profil dauerhaft löschen',
    logout: 'Abmelden',
    profileSection: 'Dein Konto',
    verified: 'Verifiziert',
    status: 'Geschütztes Konto',
    dangerZone: 'Gefahrenbereich',
    comingSoonPrivacy: 'Datenschutzeinstellungen folgen bald',
    comingSoonSecurity: 'Sicherheitseinstellungen folgen bald',
    comingSoonDelete: 'Kontolöschung folgt bald',
    accountOverview: 'Kontoübersicht',
    quickControls: 'Schnellzugriff',
    protected: 'Geschütztes Profil',
  },
  PL: {
    title: 'Ustawienia konta',
    subtitle: 'Prywatność, bezpieczeństwo, informacje prawne i działania konta',
    personal: 'Dane osobowe',
    personalSub: 'Imię, email, telefon i dane profilu',
    privacy: 'Prywatność',
    privacySub: 'Widoczność profilu i bezpieczeństwo kontaktu',
    security: 'Bezpieczeństwo',
    securitySub: 'Hasło, logowanie i ochrona',
    legal: 'Informacje prawne',
    legalSub: 'Warunki, prywatność i zasady platformy',
    deleteAccount: 'Usuń konto',
    deleteAccountSub: 'Trwale usuń swój profil',
    logout: 'Wyloguj się',
    profileSection: 'Twoje konto',
    verified: 'Zweryfikowano',
    status: 'Bezpieczne konto',
    dangerZone: 'Strefa ryzyka',
    comingSoonPrivacy: 'Ustawienia prywatności już wkrótce',
    comingSoonSecurity: 'Ustawienia bezpieczeństwa już wkrótce',
    comingSoonDelete: 'Usuwanie konta już wkrótce',
    accountOverview: 'Przegląd konta',
    quickControls: 'Szybkie ustawienia',
    protected: 'Chroniony profil',
  },
} as const;

type SettingsItem = {
  id: string;
  title: string;
  subtitle: string;
  danger?: boolean;
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

  const mainItems = useMemo<SettingsItem[]>(
    () => [
      {
        id: 'personal',
        title: text.personal,
        subtitle: text.personalSub,
        icon: '👤',
        accent: 'blue',
        onClick: () => router.push('/profile/edit'),
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
        accent: 'orange',
        onClick: () => router.push('/profile/legal'),
      },
    ],
    [
      router,
      text.comingSoonPrivacy,
      text.comingSoonSecurity,
      text.legal,
      text.legalSub,
      text.personal,
      text.personalSub,
      text.privacy,
      text.privacySub,
      text.security,
      text.securitySub,
    ]
  );

  const dangerItems = useMemo<SettingsItem[]>(
    () => [
      {
        id: 'delete',
        title: text.deleteAccount,
        subtitle: text.deleteAccountSub,
        danger: true,
        icon: '🗑️',
        accent: 'danger',
        onClick: () => alert(text.comingSoonDelete),
      },
      {
        id: 'logout',
        title: text.logout,
        subtitle: '',
        danger: true,
        icon: '⎋',
        accent: 'danger',
        onClick: () => router.push('/'),
      },
    ],
    [
      router,
      text.comingSoonDelete,
      text.deleteAccount,
      text.deleteAccountSub,
      text.logout,
    ]
  );

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
            border: '1px solid #f0e3d7',
            background: 'linear-gradient(180deg, #ffffff 0%, #fff8f8 100%)',
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
            {text.accountOverview}
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '76px 1fr',
              gap: 14,
              alignItems: 'center',
            }}
          >
            <img
              src={profile.avatar}
              alt={profile.fullName}
              style={{
                width: 76,
                height: 76,
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
                  {text.protected}
                </span>

                {profile.isVerified ? (
                  <span
                    style={{
                      borderRadius: 999,
                      padding: '8px 12px',
                      background: '#fff1f7',
                      color: '#ff4fa0',
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
            fontSize: 16,
            fontWeight: 900,
            color: '#17130f',
            marginBottom: 12,
          }}
        >
          {text.quickControls}
        </div>

        <div
          style={{
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

                  {item.subtitle ? (
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
                  ) : null}
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
