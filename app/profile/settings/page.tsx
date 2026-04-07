'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import BottomNav from '../../../components/common/BottomNav';
import { getSavedLanguage, type AppLanguage } from '../../../services/i18n';
import { getUserProfile, subscribeToUserProfile, type UserProfile } from '../../services/userProfileStore';

const settingsTexts = {
  EN: {
    title: 'Account settings',
    personal: 'Personal details',
    personalSub: 'Name, email and phone',
    privacy: 'Privacy',
    privacySub: 'Profile visibility and contact safety',
    security: 'Security',
    securitySub: 'Password and sign-in settings',
    legal: 'Legal information',
    legalSub: 'Terms, privacy policy and platform rules',
    deleteAccount: 'Delete account',
    deleteAccountSub: 'Permanently remove your profile',
    logout: 'Log out',
  },
  ES: {
    title: 'Configuración de la cuenta',
    personal: 'Datos personales',
    personalSub: 'Nombre, email y teléfono',
    privacy: 'Privacidad',
    privacySub: 'Visibilidad del perfil y seguridad del contacto',
    security: 'Seguridad',
    securitySub: 'Contraseña y acceso',
    legal: 'Información legal',
    legalSub: 'Términos, privacidad y reglas de la plataforma',
    deleteAccount: 'Eliminar cuenta',
    deleteAccountSub: 'Eliminar permanentemente tu perfil',
    logout: 'Cerrar sesión',
  },
  RU: {
    title: 'Настройки аккаунта',
    personal: 'Личные данные',
    personalSub: 'Имя, email и телефон',
    privacy: 'Приватность',
    privacySub: 'Видимость профиля и безопасность контактов',
    security: 'Безопасность',
    securitySub: 'Пароль и вход в аккаунт',
    legal: 'Юридическая информация',
    legalSub: 'Условия, приватность и правила платформы',
    deleteAccount: 'Удалить аккаунт',
    deleteAccountSub: 'Полностью удалить ваш профиль',
    logout: 'Выйти из аккаунта',
  },
  CZ: {
    title: 'Nastavení účtu',
    personal: 'Osobní údaje',
    personalSub: 'Jméno, email a telefon',
    privacy: 'Soukromí',
    privacySub: 'Viditelnost profilu a bezpečnost kontaktu',
    security: 'Zabezpečení',
    securitySub: 'Heslo a přihlášení',
    legal: 'Právní informace',
    legalSub: 'Podmínky, soukromí a pravidla platformy',
    deleteAccount: 'Smazat účet',
    deleteAccountSub: 'Trvale odstranit váš profil',
    logout: 'Odhlásit se',
  },
  DE: {
    title: 'Kontoeinstellungen',
    personal: 'Persönliche Daten',
    personalSub: 'Name, E-Mail und Telefon',
    privacy: 'Datenschutz',
    privacySub: 'Profilsichtbarkeit und Kontaktsicherheit',
    security: 'Sicherheit',
    securitySub: 'Passwort und Anmeldung',
    legal: 'Rechtliche Informationen',
    legalSub: 'AGB, Datenschutz und Plattformregeln',
    deleteAccount: 'Konto löschen',
    deleteAccountSub: 'Dein Profil dauerhaft löschen',
    logout: 'Abmelden',
  },
  PL: {
    title: 'Ustawienia konta',
    personal: 'Dane osobowe',
    personalSub: 'Imię, email i telefon',
    privacy: 'Prywatność',
    privacySub: 'Widoczność profilu i bezpieczeństwo kontaktu',
    security: 'Bezpieczeństwo',
    securitySub: 'Hasło i logowanie',
    legal: 'Informacje prawne',
    legalSub: 'Warunki, prywatność i zasady platformy',
    deleteAccount: 'Usuń konto',
    deleteAccountSub: 'Trwale usuń swój profil',
    logout: 'Wyloguj się',
  },
} as const;

type SettingsItem = {
  id: string;
  title: string;
  subtitle: string;
  danger?: boolean;
  onClick: () => void;
};

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

  const items = useMemo<SettingsItem[]>(
    () => [
      {
        id: 'personal',
        title: text.personal,
        subtitle: text.personalSub,
        onClick: () => router.push('/profile/edit'),
      },
      {
        id: 'privacy',
        title: text.privacy,
        subtitle: text.privacySub,
        onClick: () => alert(profile.isVerified ? 'Privacy settings coming soon' : 'Privacy settings'),
      },
      {
        id: 'security',
        title: text.security,
        subtitle: text.securitySub,
        onClick: () => alert('Security settings coming soon'),
      },
      {
        id: 'legal',
        title: text.legal,
        subtitle: text.legalSub,
        onClick: () => alert('Legal information coming soon'),
      },
      {
        id: 'delete',
        title: text.deleteAccount,
        subtitle: text.deleteAccountSub,
        danger: true,
        onClick: () => alert('Delete account flow coming soon'),
      },
      {
        id: 'logout',
        title: text.logout,
        subtitle: '',
        danger: true,
        onClick: () => router.push('/'),
      },
    ],
    [
      profile.isVerified,
      router,
      text.deleteAccount,
      text.deleteAccountSub,
      text.legal,
      text.legalSub,
      text.logout,
      text.personal,
      text.personalSub,
      text.privacy,
      text.privacySub,
      text.security,
      text.securitySub,
    ]
  );

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

        <div className="mt-6 rounded-[28px] border border-[#efe4d7] bg-white p-4 shadow-sm">
          <div className="text-sm font-bold text-[#1d1712]">{profile.fullName}</div>
          <div className="mt-1 text-xs text-[#7a7065]">{profile.email}</div>
        </div>

        <div className="mt-5 overflow-hidden rounded-[28px] border border-[#efe4d7] bg-white shadow-sm">
          {items.map((item, index) => (
            <button
              key={item.id}
              type="button"
              onClick={item.onClick}
              className={`flex w-full items-center justify-between gap-3 px-5 py-4 text-left ${
                index !== 0 ? 'border-t border-[#f3eadf]' : ''
              }`}
            >
              <div className="min-w-0">
                <div
                  className={`text-sm font-bold ${
                    item.danger ? 'text-red-600' : 'text-[#1d1712]'
                  }`}
                >
                  {item.title}
                </div>

                {item.subtitle ? (
                  <div className="mt-1 text-xs leading-5 text-[#7a7065]">{item.subtitle}</div>
                ) : null}
              </div>

              <span className={`text-base ${item.danger ? 'text-red-300' : 'text-[#8c7d70]'}`}>
                ›
              </span>
            </button>
          ))}
        </div>
      </div>

      <BottomNav active="profile" />
    </main>
  );
}
