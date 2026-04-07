'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import BottomNav from '../../../components/common/BottomNav';
import {
  getSavedLanguage,
  saveLanguage,
  type AppLanguage,
} from '../../../services/i18n';
import {
  getUserProfile,
  subscribeToUserProfile,
  updateUserProfile,
  type UserProfile,
} from '../../services/userProfileStore';

const pageTexts = {
  EN: {
    title: 'Language & region',
    language: 'Language',
    region: 'Region',
    saved: 'Settings saved',
  },
  ES: {
    title: 'Idioma y región',
    language: 'Idioma',
    region: 'Región',
    saved: 'Ajustes guardados',
  },
  RU: {
    title: 'Язык и регион',
    language: 'Язык',
    region: 'Регион',
    saved: 'Настройки сохранены',
  },
  CZ: {
    title: 'Jazyk a region',
    language: 'Jazyk',
    region: 'Region',
    saved: 'Nastavení uloženo',
  },
  DE: {
    title: 'Sprache & Region',
    language: 'Sprache',
    region: 'Region',
    saved: 'Einstellungen gespeichert',
  },
  PL: {
    title: 'Język i region',
    language: 'Język',
    region: 'Region',
    saved: 'Ustawienia zapisane',
  },
} as const;

const languageOptions: { value: AppLanguage; label: string }[] = [
  { value: 'EN', label: 'English' },
  { value: 'ES', label: 'Español' },
  { value: 'RU', label: 'Русский' },
  { value: 'CZ', label: 'Čeština' },
  { value: 'DE', label: 'Deutsch' },
  { value: 'PL', label: 'Polski' },
];

const regionOptions = [
  'United Kingdom',
  'Spain',
  'Czech Republic',
  'Germany',
  'Poland',
  'Ukraine',
];

export default function LanguageRegionPage() {
  const router = useRouter();

  const [language, setLanguage] = useState<AppLanguage>('EN');
  const [profile, setProfile] = useState<UserProfile>(getUserProfile());
  const [selectedLanguage, setSelectedLanguage] = useState<AppLanguage>(getSavedLanguage());
  const [selectedRegion, setSelectedRegion] = useState(getUserProfile().region);

  useEffect(() => {
    const syncLanguage = () => {
      const nextLanguage = getSavedLanguage();
      setLanguage(nextLanguage);
      setSelectedLanguage(nextLanguage);
    };

    const syncProfile = () => {
      const nextProfile = getUserProfile();
      setProfile(nextProfile);
      setSelectedRegion(nextProfile.region);
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
    () => pageTexts[language as keyof typeof pageTexts] || pageTexts.EN,
    [language]
  );

  const handleSave = () => {
    saveLanguage(selectedLanguage);
    updateUserProfile({
      language: selectedLanguage,
      region: selectedRegion,
    });
    alert(text.saved);
    router.push('/profile');
  };

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

          <button
            type="button"
            onClick={handleSave}
            className="rounded-full bg-[#2f241c] px-4 py-2 text-sm font-bold text-white"
          >
            OK
          </button>
        </div>

        <div className="mt-6 rounded-[28px] border border-[#efe4d7] bg-white p-4 shadow-sm">
          <div className="text-base font-extrabold text-[#1d1712]">{text.language}</div>

          <div className="mt-4 space-y-3">
            {languageOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setSelectedLanguage(option.value)}
                className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left ${
                  selectedLanguage === option.value
                    ? 'border-[#2f241c] bg-[#f8f1e7]'
                    : 'border-[#efe4d7] bg-[#fffdf9]'
                }`}
              >
                <span className="text-sm font-bold text-[#1d1712]">{option.label}</span>
                {selectedLanguage === option.value && (
                  <span className="text-sm font-bold text-[#2f241c]">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 rounded-[28px] border border-[#efe4d7] bg-white p-4 shadow-sm">
          <div className="text-base font-extrabold text-[#1d1712]">{text.region}</div>

          <div className="mt-4 space-y-3">
            {regionOptions.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setSelectedRegion(option)}
                className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left ${
                  selectedRegion === option
                    ? 'border-[#2f241c] bg-[#f8f1e7]'
                    : 'border-[#efe4d7] bg-[#fffdf9]'
                }`}
              >
                <span className="text-sm font-bold text-[#1d1712]">{option}</span>
                {selectedRegion === option && (
                  <span className="text-sm font-bold text-[#2f241c]">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 rounded-[28px] border border-[#efe4d7] bg-white p-4 text-sm leading-6 text-[#6f6458] shadow-sm">
          {profile.fullName} · {selectedLanguage} · {selectedRegion}
        </div>
      </div>

      <BottomNav active="profile" />
    </main>
  );
}
