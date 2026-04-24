'use client';

import { useEffect, useRef, useState } from 'react';
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
        width: 30,
        height: 30,
        borderRadius: 999,
        border: '2px solid #111111',
        background: checked ? '#35c94a' : '#ffffff',
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 17,
        fontWeight: 900,
        flexShrink: 0,
        boxShadow: checked ? '0 4px 10px rgba(53,201,74,0.22)' : 'none',
      }}
    >
      {checked ? '✓' : ''}
    </div>
  );
}

export default function LanguagePage() {
  const router = useRouter();
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [language, setLanguage] = useState<AppLanguage>(getSavedLanguage());
  const [closingLanguage, setClosingLanguage] = useState<AppLanguage | null>(null);

  useEffect(() => {
    const unsubLanguage = subscribeToLanguageChange((nextLanguage) => {
      setLanguage(nextLanguage);
    });

    const unsubProfile = subscribeToUserProfile(() => {});

    return () => {
      unsubLanguage();
      unsubProfile();

      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  const closePage = () => {
    router.back();
  };

  const applyLanguage = (nextLanguage: AppLanguage) => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
    }

    setLanguage(nextLanguage);
    setClosingLanguage(nextLanguage);

    saveLanguage(nextLanguage);

    updateAppRegionSettings({
      language: nextLanguage,
    });

    updateUserProfile({
      language: nextLanguage,
    });

    closeTimerRef.current = setTimeout(() => {
      router.back();
    }, 450);
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#f6f4ef',
        padding: '18px 14px 128px',
        fontFamily: 'Arial, sans-serif',
        color: '#17130f',
      }}
    >
      <div
        style={{
          maxWidth: 430,
          margin: '0 auto',
          position: 'relative',
        }}
      >
        <button
          type="button"
          onClick={closePage}
          aria-label="Close"
          style={{
            position: 'fixed',
            top: 18,
            right: 18,
            width: 52,
            height: 52,
            borderRadius: 999,
            border: '2px solid #111111',
            background: '#ffffff',
            color: '#17130f',
            fontSize: 28,
            fontWeight: 900,
            cursor: 'pointer',
            zIndex: 1300,
            boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            lineHeight: 1,
          }}
        >
          ×
        </button>

        <div
          style={{
            background: '#ffffff',
            borderRadius: 30,
            padding: '76px 14px 14px',
            border: '2px solid #111111',
            display: 'grid',
            gap: 10,
          }}
        >
          {languageOptions.map((option) => {
            const checked = language === option.value || closingLanguage === option.value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => applyLanguage(option.value)}
                style={{
                  width: '100%',
                  display: 'grid',
                  gridTemplateColumns: '34px minmax(0, 1fr) 34px',
                  alignItems: 'center',
                  gap: 12,
                  padding: '14px 12px',
                  background: checked ? '#f7f1e7' : '#ffffff',
                  border: '2px solid #111111',
                  textAlign: 'left',
                  borderRadius: 20,
                  cursor: 'pointer',
                  minHeight: 72,
                  boxSizing: 'border-box',
                }}
              >
                <div
                  style={{
                    fontSize: 23,
                    lineHeight: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {option.flag}
                </div>

                <div
                  style={{
                    fontSize: 17,
                    fontWeight: 900,
                    color: '#17130f',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
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
