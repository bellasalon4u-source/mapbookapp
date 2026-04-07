'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import BottomNav from '../../../components/common/BottomNav';
import { getSavedLanguage, type AppLanguage } from '../../../services/i18n';
import {
  getUserProfile,
  subscribeToUserProfile,
  updateUserProfile,
  type UserProfile,
} from '../../services/userProfileStore';

const editProfileTexts = {
  EN: {
    title: 'Edit profile',
    save: 'Save',
    fullName: 'Full name',
    email: 'Email',
    phone: 'Phone',
    city: 'City',
    bio: 'About me',
    bioPlaceholder: 'Tell us a little about yourself',
    avatar: 'Profile photo',
    saved: 'Profile saved',
  },
  ES: {
    title: 'Editar perfil',
    save: 'Guardar',
    fullName: 'Nombre completo',
    email: 'Correo electrónico',
    phone: 'Teléfono',
    city: 'Ciudad',
    bio: 'Sobre mí',
    bioPlaceholder: 'Cuéntanos un poco sobre ti',
    avatar: 'Foto de perfil',
    saved: 'Perfil guardado',
  },
  RU: {
    title: 'Редактировать профиль',
    save: 'Сохранить',
    fullName: 'Имя и фамилия',
    email: 'Email',
    phone: 'Телефон',
    city: 'Город',
    bio: 'О себе',
    bioPlaceholder: 'Расскажите немного о себе',
    avatar: 'Фото профиля',
    saved: 'Профиль сохранён',
  },
  CZ: {
    title: 'Upravit profil',
    save: 'Uložit',
    fullName: 'Jméno a příjmení',
    email: 'Email',
    phone: 'Telefon',
    city: 'Město',
    bio: 'O mně',
    bioPlaceholder: 'Řekněte nám něco o sobě',
    avatar: 'Profilová fotka',
    saved: 'Profil uložen',
  },
  DE: {
    title: 'Profil bearbeiten',
    save: 'Speichern',
    fullName: 'Vor- und Nachname',
    email: 'E-Mail',
    phone: 'Telefon',
    city: 'Stadt',
    bio: 'Über mich',
    bioPlaceholder: 'Erzähl etwas über dich',
    avatar: 'Profilfoto',
    saved: 'Profil gespeichert',
  },
  PL: {
    title: 'Edytuj profil',
    save: 'Zapisz',
    fullName: 'Imię i nazwisko',
    email: 'Email',
    phone: 'Telefon',
    city: 'Miasto',
    bio: 'O mnie',
    bioPlaceholder: 'Napisz coś o sobie',
    avatar: 'Zdjęcie profilowe',
    saved: 'Profil zapisany',
  },
} as const;

export default function EditProfilePage() {
  const router = useRouter();

  const [language, setLanguage] = useState<AppLanguage>('EN');
  const [profile, setProfile] = useState<UserProfile>(getUserProfile());
  const [fullName, setFullName] = useState(profile.fullName);
  const [email, setEmail] = useState(profile.email);
  const [phone, setPhone] = useState(profile.phone);
  const [city, setCity] = useState(profile.city);
  const [bio, setBio] = useState(profile.bio);
  const [avatar, setAvatar] = useState(profile.avatar);

  useEffect(() => {
    const syncLanguage = () => {
      setLanguage(getSavedLanguage());
    };

    const syncProfile = () => {
      const next = getUserProfile();
      setProfile(next);
      setFullName(next.fullName);
      setEmail(next.email);
      setPhone(next.phone);
      setCity(next.city);
      setBio(next.bio);
      setAvatar(next.avatar);
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
    () => editProfileTexts[language as keyof typeof editProfileTexts] || editProfileTexts.EN,
    [language]
  );

  const avatarOptions = [
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
  ];

  const handleSave = () => {
    updateUserProfile({
      fullName,
      email,
      phone,
      city,
      bio,
      avatar,
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
            {text.save}
          </button>
        </div>

        <div className="mt-6 rounded-[32px] border border-[#efe4d7] bg-white p-5 shadow-sm">
          <div className="flex flex-col items-center">
            <img
              src={avatar}
              alt={profile.fullName}
              className="h-24 w-24 rounded-[28px] object-cover"
            />

            <div className="mt-4 w-full">
              <p className="mb-3 text-sm font-bold text-[#1d1712]">{text.avatar}</p>

              <div className="grid grid-cols-3 gap-3">
                {avatarOptions.map((avatarUrl) => (
                  <button
                    key={avatarUrl}
                    type="button"
                    onClick={() => setAvatar(avatarUrl)}
                    className={`overflow-hidden rounded-2xl border ${
                      avatar === avatarUrl ? 'border-[#2f241c]' : 'border-[#efe4d7]'
                    }`}
                  >
                    <img
                      src={avatarUrl}
                      alt="Avatar option"
                      className="h-20 w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-bold text-[#1d1712]">
                {text.fullName}
              </span>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-2xl border border-[#efe4d7] bg-[#fffdf9] px-4 py-3 text-sm text-[#1d1712] outline-none"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-bold text-[#1d1712]">
                {text.email}
              </span>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-2xl border border-[#efe4d7] bg-[#fffdf9] px-4 py-3 text-sm text-[#1d1712] outline-none"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-bold text-[#1d1712]">
                {text.phone}
              </span>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-2xl border border-[#efe4d7] bg-[#fffdf9] px-4 py-3 text-sm text-[#1d1712] outline-none"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-bold text-[#1d1712]">
                {text.city}
              </span>
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full rounded-2xl border border-[#efe4d7] bg-[#fffdf9] px-4 py-3 text-sm text-[#1d1712] outline-none"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-bold text-[#1d1712]">
                {text.bio}
              </span>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder={text.bioPlaceholder}
                rows={4}
                className="w-full resize-none rounded-2xl border border-[#efe4d7] bg-[#fffdf9] px-4 py-3 text-sm text-[#1d1712] outline-none"
              />
            </label>
          </div>
        </div>
      </div>

      <BottomNav active="profile" />
    </main>
  );
}
