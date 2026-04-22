'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import BottomNav from '../../../components/common/BottomNav';
import {
  getSavedLanguage,
  saveLanguage,
  subscribeToLanguageChange,
  type AppLanguage,
} from '../../../services/i18n';
import { updateAppRegionSettings } from '../../../services/appRegionStore';
import {
  subscribeToUserProfile,
  updateUserProfile,
} from '../../services/userProfileStore';

type PageTextShape = {
  title: string;
  subtitle: string;
};

const pageTexts: Record<AppLanguage, PageTextShape> = {
  EN: { title: 'Language', subtitle: 'Choose app language' },
  ES: { title: 'Idioma', subtitle: 'Elige el idioma de la aplicación' },
  RU: { title: 'Язык', subtitle: 'Выберите язык приложения' },
  UA: { title: 'Мова', subtitle: 'Оберіть мову застосунку' },
  CZ: { title: 'Jazyk', subtitle: 'Vyberte jazyk aplikace' },
  DE: { title: 'Sprache', subtitle: 'Wähle die Sprache der App' },
  IT: { title: 'Lingua', subtitle: 'Scegli la lingua dell’app' },
  FR: { title: 'Langue', subtitle: 'Choisissez la langue de l’application' },
  AR: { title: 'اللغة', subtitle: 'اختر لغة التطبيق' },
  PL: { title: 'Język', subtitle: 'Wybierz język aplikacji' },
};

const languageOptions: { value: AppLanguage; label: string; flag: string }[] = [
  { value: 'EN', label: 'English', flag: '🇬🇧' },
  { value: 'ES', label: 'Español', flag: '🇪🇸' },
  { value: 'RU', label: 'Русский', flag: '🇷🇺' },
  { value: 'UA', label: 'Українська', flag: '🇺🇦' },
  { value: 'CZ', label: 'Čeština', flag: '🇨🇿' },
  { value: 'DE', label: 'Deutsch', flag: '🇩🇪' },
  { value: 'IT', label: 'Italiano', flag: '🇮🇹' },
  { value: 'FR', label: 'Français', flag: '🇫🇷' },
  { value: 'AR', label: 'العربية', flag: '🇸🇦' },
  { value: 'PL', label: 'Polski', flag: '🇵🇱' },
];

function CheckMark({ checked }: { checked: boolean }) {
  return (
    <div
      style={{
        width: 28,
        height: 28,
        borderRadius: 999,
        border: '2px solid #111111',
        background: checked ? '#35c94a' : '#ffffff',
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 16,
        fontWeight: 900,
        flexShrink: 0,
      }}
    >
      {checked ? '✓' : ''}
    </div>
  );
}

export default function LanguagePage() {
  const router = useRouter();
  const [language, setLanguage] = useState<AppLanguage>(getSavedLanguage());

  useEffect(() => {
    const unsubLanguage = subscribeToLanguageChange((nextLanguage) => {
      setLanguage(nextLanguage);
    });

    const unsubProfile = subscribeToUserProfile(() => {});

    return () => {
      unsubLanguage();
      unsubProfile();
    };
  }, []);

  const text = pageTexts[language] || pageTexts.EN;

  const applyLanguage = (nextLanguage: AppLanguage) => {
    setLanguage(nextLanguage);
    saveLanguage(nextLanguage);

    updateAppRegionSettings({
      language: nextLanguage,
    });

    updateUserProfile({
      language: nextLanguage,
    });
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#f6f4ef',
        padding: '16px 14px 120px',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <div style={{ maxWidth: 430, margin: '0 auto' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '52px 1fr',
            alignItems: 'center',
            gap: 12,
            marginBottom: 16,
          }}
        >
          <button
            type="button"
            onClick={() => router.back()}
            style={{
              width: 52,
              height: 52,
              borderRadius: 18,
              border: '2px solid #111111',
              background: '#fff',
              fontSize: 24,
              fontWeight: 900,
              color: '#17130f',
              cursor: 'pointer',
            }}
          >
            ←
          </button>

          <div>
            <h1
              style={{
                fontSize: 24,
                fontWeight: 900,
                color: '#17130f',
                margin: 0,
                lineHeight: 1.05,
              }}
            >
              {text.title}
            </h1>
            <div
              style={{
                marginTop: 6,
                fontSize: 13,
                color: '#7b7268',
                fontWeight: 700,
                lineHeight: 1.35,
              }}
            >
              {text.subtitle}
            </div>
          </div>
        </div>

        <div
          style={{
            background: '#ffffff',
            borderRadius: 26,
            padding: 14,
            border: '2px solid #111111',
            display: 'grid',
            gap: 10,
          }}
        >
          {languageOptions.map((option) => {
            const checked = language === option.value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => applyLanguage(option.value)}
                style={{
                  width: '100%',
                  display: 'grid',
                  gridTemplateColumns: '34px 1fr auto',
                  alignItems: 'center',
                  gap: 12,
                  padding: '14px 12px',
                  background: checked ? '#f7f1e7' : '#fff',
                  border: '2px solid #111111',
                  textAlign: 'left',
                  borderRadius: 18,
                  cursor: 'pointer',
                }}
              >
                <div style={{ fontSize: 22 }}>{option.flag}</div>

                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 900,
                    color: '#17130f',
                  }}
                >
                  {option.label}
                </div>

                <CheckMark checked={checked} />
              </button>
            );
          })}
        </div>
      </div>

      <BottomNav active="profile" />
    </main>
  );
}
