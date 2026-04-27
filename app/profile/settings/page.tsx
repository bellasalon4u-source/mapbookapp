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
  type UserProfile,
} from '../../services/userProfileStore';

type SettingsTextShape = {
  title: string;
  subtitle: string;
  profileSection: string;
  personal: string;
  personalSub: string;
  privacy: string;
  privacySub: string;
  security: string;
  securitySub: string;
  legal: string;
  legalSub: string;
  languageRegion: string;
  languageRegionSub: string;
  notifications: string;
  notificationsSub: string;
  payments: string;
  paymentsSub: string;
  deleteAccount: string;
  deleteAccountSub: string;
  logout: string;
  logoutSub: string;
  verified: string;
  status: string;
  dangerZone: string;
  comingSoonPrivacy: string;
  comingSoonSecurity: string;
  comingSoonDelete: string;
  accountReady: string;
  protectedBy: string;
};

type SettingsItem = {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  accent: 'pink' | 'green' | 'blue' | 'violet' | 'orange' | 'danger' | 'neutral';
  onClick: () => void;
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

const settingsTexts: Record<AppLanguage, SettingsTextShape> = {
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
    accountReady: 'Account ready',
    protectedBy: 'Protected by Olamep',
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
    accountReady: 'Аккаунт готов',
    protectedBy: 'Защищено Olamep',
  },
  UA: {
    title: 'Налаштування акаунта',
    subtitle: 'Приватність, безпека, юридична інформація та дії акаунта',
    profileSection: 'Ваш акаунт',
    personal: 'Особисті дані',
    personalSub: 'Ім’я, email, телефон і дані профілю',
    privacy: 'Приватність',
    privacySub: 'Видимість профілю і безпека контактів',
    security: 'Безпека',
    securitySub: 'Пароль, вхід і захист акаунта',
    legal: 'Юридична інформація',
    legalSub: 'Умови, приватність і правила платформи',
    languageRegion: 'Мова та регіон',
    languageRegionSub: 'Мова додатка, країна, валюта і локація',
    notifications: 'Сповіщення',
    notificationsSub: 'Бронювання, повідомлення і системні оповіщення',
    payments: 'Платежі та гаманець',
    paymentsSub: 'Картки, баланс, повернення і налаштування виплат',
    deleteAccount: 'Видалити акаунт',
    deleteAccountSub: 'Повністю видалити ваш профіль',
    logout: 'Вийти з акаунта',
    logoutSub: 'Завершити поточну сесію',
    verified: 'Перевірено',
    status: 'Акаунт захищено',
    dangerZone: 'Небезпечна зона',
    comingSoonPrivacy: 'Налаштування приватності скоро з’являться',
    comingSoonSecurity: 'Налаштування безпеки скоро з’являться',
    comingSoonDelete: 'Функція видалення акаунта скоро з’явиться',
    accountReady: 'Акаунт готовий',
    protectedBy: 'Захищено Olamep',
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
    accountReady: 'Cuenta lista',
    protectedBy: 'Protegido por Olamep',
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
    accountReady: 'Účet připraven',
    protectedBy: 'Chráněno Olamep',
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
    accountReady: 'Konto bereit',
    protectedBy: 'Geschützt durch Olamep',
  },
  IT: {
    title: 'Impostazioni account',
    subtitle: 'Privacy, sicurezza, informazioni legali e azioni account',
    profileSection: 'Il tuo account',
    personal: 'Dati personali',
    personalSub: 'Nome, email, telefono e profilo',
    privacy: 'Privacy',
    privacySub: 'Visibilità profilo e sicurezza contatti',
    security: 'Sicurezza',
    securitySub: 'Password, accesso e protezione',
    legal: 'Informazioni legali',
    legalSub: 'Termini, privacy e regole piattaforma',
    languageRegion: 'Lingua e regione',
    languageRegionSub: 'Lingua app, paese, valuta e posizione',
    notifications: 'Notifiche',
    notificationsSub: 'Prenotazioni, messaggi e avvisi di sistema',
    payments: 'Pagamenti e wallet',
    paymentsSub: 'Carte, saldo, rimborsi e pagamenti',
    deleteAccount: 'Elimina account',
    deleteAccountSub: 'Rimuovi definitivamente il profilo',
    logout: 'Esci',
    logoutSub: 'Esci dalla sessione corrente',
    verified: 'Verificato',
    status: 'Account sicuro',
    dangerZone: 'Zona pericolosa',
    comingSoonPrivacy: 'Impostazioni privacy presto disponibili',
    comingSoonSecurity: 'Impostazioni sicurezza presto disponibili',
    comingSoonDelete: 'Eliminazione account presto disponibile',
    accountReady: 'Account pronto',
    protectedBy: 'Protetto da Olamep',
  },
  FR: {
    title: 'Paramètres du compte',
    subtitle: 'Confidentialité, sécurité, infos légales et actions',
    profileSection: 'Votre compte',
    personal: 'Détails personnels',
    personalSub: 'Nom, email, téléphone et profil',
    privacy: 'Confidentialité',
    privacySub: 'Visibilité du profil et sécurité des contacts',
    security: 'Sécurité',
    securitySub: 'Mot de passe, connexion et protection',
    legal: 'Informations légales',
    legalSub: 'Conditions, confidentialité et règles',
    languageRegion: 'Langue et région',
    languageRegionSub: 'Langue app, pays, devise et localisation',
    notifications: 'Notifications',
    notificationsSub: 'Réservations, messages et alertes système',
    payments: 'Paiements et wallet',
    paymentsSub: 'Cartes, solde, remboursements et paiements',
    deleteAccount: 'Supprimer le compte',
    deleteAccountSub: 'Supprimer définitivement votre profil',
    logout: 'Se déconnecter',
    logoutSub: 'Quitter la session actuelle',
    verified: 'Vérifié',
    status: 'Compte sécurisé',
    dangerZone: 'Zone dangereuse',
    comingSoonPrivacy: 'Paramètres de confidentialité bientôt disponibles',
    comingSoonSecurity: 'Paramètres de sécurité bientôt disponibles',
    comingSoonDelete: 'Suppression du compte bientôt disponible',
    accountReady: 'Compte prêt',
    protectedBy: 'Protégé par Olamep',
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
    accountReady: 'Konto gotowe',
    protectedBy: 'Chronione przez Olamep',
  },
  AR: {
    title: 'إعدادات الحساب',
    subtitle: 'الخصوصية والأمان والمعلومات القانونية وإجراءات الحساب',
    profileSection: 'حسابك',
    personal: 'البيانات الشخصية',
    personalSub: 'الاسم والبريد والهاتف ومعلومات الملف',
    privacy: 'الخصوصية',
    privacySub: 'ظهور الملف وأمان التواصل',
    security: 'الأمان',
    securitySub: 'كلمة المرور وتسجيل الدخول والحماية',
    legal: 'معلومات قانونية',
    legalSub: 'الشروط والخصوصية وقواعد المنصة',
    languageRegion: 'اللغة والمنطقة',
    languageRegionSub: 'لغة التطبيق، الدولة، العملة والموقع',
    notifications: 'الإشعارات',
    notificationsSub: 'الحجوزات والرسائل وتنبيهات النظام',
    payments: 'المدفوعات والمحفظة',
    paymentsSub: 'البطاقات والرصيد والاسترداد والدفع',
    deleteAccount: 'حذف الحساب',
    deleteAccountSub: 'إزالة ملفك الشخصي نهائياً',
    logout: 'تسجيل الخروج',
    logoutSub: 'الخروج من الجلسة الحالية',
    verified: 'موثق',
    status: 'حساب آمن',
    dangerZone: 'منطقة الخطر',
    comingSoonPrivacy: 'إعدادات الخصوصية قريباً',
    comingSoonSecurity: 'إعدادات الأمان قريباً',
    comingSoonDelete: 'حذف الحساب قريباً',
    accountReady: 'الحساب جاهز',
    protectedBy: 'محمي بواسطة Olamep',
  },
};

function getText(language: AppLanguage) {
  return settingsTexts[language] || settingsTexts.EN;
}

function accentStyles(accent: SettingsItem['accent']) {
  if (accent === 'pink') return { background: BRAND.softPink, color: BRAND.pink };
  if (accent === 'green') return { background: BRAND.softGreen, color: '#11883d' };
  if (accent === 'blue') return { background: BRAND.softBlue, color: BRAND.blue };
  if (accent === 'violet') return { background: BRAND.softViolet, color: '#7254df' };
  if (accent === 'orange') return { background: BRAND.softOrange, color: '#b47b00' };
  if (accent === 'danger') return { background: '#fff1f1', color: '#ef4444' };
  return { background: '#f2f4f7', color: BRAND.muted };
}

export default function AccountSettingsPage() {
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
              fontSize: 18,
              lineHeight: 1.05,
              fontWeight: 900,
              color: BRAND.navy,
              marginBottom: 13,
            }}
          >
            {text.profileSection}
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '78px minmax(0, 1fr)',
              gap: 13,
              alignItems: 'center',
            }}
          >
            <img
              src={profile.avatar}
              alt={profile.fullName}
              style={{
                width: 78,
                height: 78,
                borderRadius: 23,
                objectFit: 'cover',
                display: 'block',
                border: `2.5px solid ${BRAND.border}`,
                background: '#ffffff',
              }}
            />

            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: 22,
                  lineHeight: 1.05,
                  fontWeight: 900,
                  color: BRAND.navy,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {profile.fullName}
              </div>

              <div
                style={{
                  marginTop: 6,
                  fontSize: 13,
                  color: BRAND.muted,
                  fontWeight: 800,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {profile.email}
              </div>

              <div
                style={{
                  marginTop: 10,
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 7,
                }}
              >
                <span
                  style={{
                    minHeight: 30,
                    padding: '0 10px',
                    borderRadius: 999,
                    border: `2px solid ${BRAND.border}`,
                    background: BRAND.softGreen,
                    color: '#11883d',
                    fontSize: 11,
                    fontWeight: 900,
                    display: 'inline-flex',
                    alignItems: 'center',
                    whiteSpace: 'nowrap',
                  }}
                >
                  🛡️ {text.status}
                </span>

                {profile.isVerified ? (
                  <span
                    style={{
                      minHeight: 30,
                      padding: '0 10px',
                      borderRadius: 999,
                      border: `2px solid ${BRAND.border}`,
                      background: BRAND.softBlue,
                      color: BRAND.blue,
                      fontSize: 11,
                      fontWeight: 900,
                      display: 'inline-flex',
                      alignItems: 'center',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    ✓ {text.verified}
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          <div
            style={{
              marginTop: 13,
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 9,
            }}
          >
            <div
              style={{
                minHeight: 58,
                borderRadius: 18,
                border: `2.5px solid ${BRAND.border}`,
                background: '#ffffff',
                padding: 10,
                boxSizing: 'border-box',
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  lineHeight: 1.15,
                  fontWeight: 900,
                  color: BRAND.blue,
                }}
              >
                {text.accountReady}
              </div>
            </div>

            <div
              style={{
                minHeight: 58,
                borderRadius: 18,
                border: `2.5px solid ${BRAND.border}`,
                background: '#ffffff',
                padding: 10,
                boxSizing: 'border-box',
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  lineHeight: 1.15,
                  fontWeight: 900,
                  color: '#11883d',
                }}
              >
                {text.protectedBy}
              </div>
            </div>
          </div>
        </section>

        <section
          style={{
            marginTop: 18,
            overflow: 'hidden',
            borderRadius: 26,
            border: `2.5px solid ${BRAND.border}`,
            background: '#ffffff',
            boxShadow: '0 8px 20px rgba(7,27,70,0.05)',
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
                  gridTemplateColumns: '58px minmax(0, 1fr) auto',
                  gap: 12,
                  alignItems: 'center',
                  padding: '13px',
                  textAlign: 'left',
                  border: 'none',
                  borderTop: index !== 0 ? `2px solid ${BRAND.border}` : 'none',
                  background: '#ffffff',
                  cursor: 'pointer',
                }}
              >
                <div
                  style={{
                    width: 58,
                    height: 58,
                    borderRadius: 18,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 27,
                    border: `2.5px solid ${BRAND.border}`,
                    background: accent.background,
                    color: accent.color,
                    flexShrink: 0,
                  }}
                >
                  {item.icon}
                </div>

                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 16,
                      lineHeight: 1.1,
                      fontWeight: 900,
                      color: BRAND.navy,
                    }}
                  >
                    {item.title}
                  </div>

                  <p
                    style={{
                      margin: '5px 0 0',
                      fontSize: 13,
                      lineHeight: 1.3,
                      color: BRAND.muted,
                      fontWeight: 800,
                    }}
                  >
                    {item.subtitle}
                  </p>
                </div>

                <span
                  style={{
                    fontSize: 28,
                    color: BRAND.border,
                    fontWeight: 900,
                    lineHeight: 1,
                  }}
                >
                  ›
                </span>
              </button>
            );
          })}
        </section>

        <section
          style={{
            marginTop: 18,
            borderRadius: 26,
            border: `2.5px solid ${BRAND.border}`,
            background: '#fff8f8',
            padding: 13,
            boxShadow: '0 8px 20px rgba(7,27,70,0.05)',
          }}
        >
          <div
            style={{
              fontSize: 20,
              lineHeight: 1,
              fontWeight: 900,
              color: '#ef4444',
              marginBottom: 11,
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
                  gridTemplateColumns: '58px minmax(0, 1fr) auto',
                  gap: 12,
                  alignItems: 'center',
                  padding: 12,
                  textAlign: 'left',
                  border: `2.5px solid ${BRAND.border}`,
                  borderRadius: 22,
                  background: '#ffffff',
                  cursor: 'pointer',
                }}
              >
                <div
                  style={{
                    width: 58,
                    height: 58,
                    borderRadius: 18,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 27,
                    border: `2.5px solid ${BRAND.border}`,
                    background: '#fff1f1',
                    color: '#ef4444',
                    flexShrink: 0,
                  }}
                >
                  {item.icon}
                </div>

                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 16,
                      lineHeight: 1.1,
                      fontWeight: 900,
                      color: '#ef4444',
                    }}
                  >
                    {item.title}
                  </div>

                  <p
                    style={{
                      margin: '5px 0 0',
                      fontSize: 13,
                      lineHeight: 1.3,
                      color: '#b66161',
                      fontWeight: 800,
                    }}
                  >
                    {item.subtitle}
                  </p>
                </div>

                <span
                  style={{
                    fontSize: 28,
                    color: '#ef4444',
                    fontWeight: 900,
                    lineHeight: 1,
                  }}
                >
                  ›
                </span>
              </button>
            ))}
          </div>
        </section>
      </div>

      <BottomNav active="profile" />
    </main>
  );
}
