'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import BottomNav from '../../../components/common/BottomNav';
import { getSavedLanguage, type AppLanguage } from '../../../services/i18n';

const savedPlacesTexts = {
  EN: {
    title: 'Saved places',
    empty: 'You have no saved places yet',
    openMap: 'Open on map',
    remove: 'Remove',
  },
  ES: {
    title: 'Lugares guardados',
    empty: 'Todavía no tienes lugares guardados',
    openMap: 'Abrir en mapa',
    remove: 'Eliminar',
  },
  RU: {
    title: 'Сохранённые места',
    empty: 'У вас пока нет сохранённых мест',
    openMap: 'Открыть на карте',
    remove: 'Убрать',
  },
  CZ: {
    title: 'Uložená místa',
    empty: 'Zatím nemáte uložená místa',
    openMap: 'Otevřít na mapě',
    remove: 'Odebrat',
  },
  DE: {
    title: 'Gespeicherte Orte',
    empty: 'Du hast noch keine gespeicherten Orte',
    openMap: 'Auf Karte öffnen',
    remove: 'Entfernen',
  },
  PL: {
    title: 'Zapisane miejsca',
    empty: 'Nie masz jeszcze zapisanych miejsc',
    openMap: 'Otwórz na mapie',
    remove: 'Usuń',
  },
} as const;

type SavedPlace = {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  lat: number;
  lng: number;
};

const defaultSavedPlaces: SavedPlace[] = [
  {
    id: 'place_1',
    title: 'Любимый салон',
    subtitle: 'Camden, London',
    image:
      'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80',
    lat: 51.539,
    lng: -0.1426,
  },
  {
    id: 'place_2',
    title: 'Студия массажа',
    subtitle: 'Islington, London',
    image:
      'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=800&q=80',
    lat: 51.5465,
    lng: -0.1058,
  },
  {
    id: 'place_3',
    title: 'Барбершоп',
    subtitle: 'Soho, London',
    image:
      'https://images.unsplash.com/photo-1517832606299-7ae9b720a186?auto=format&fit=crop&w=800&q=80',
    lat: 51.5136,
    lng: -0.1365,
  },
];

export default function SavedPlacesPage() {
  const router = useRouter();

  const [language, setLanguage] = useState<AppLanguage>('EN');
  const [places, setPlaces] = useState<SavedPlace[]>(defaultSavedPlaces);

  useEffect(() => {
    const syncLanguage = () => {
      setLanguage(getSavedLanguage());
    };

    syncLanguage();
    window.addEventListener('focus', syncLanguage);

    return () => {
      window.removeEventListener('focus', syncLanguage);
    };
  }, []);

  const text = useMemo(
    () => savedPlacesTexts[language as keyof typeof savedPlacesTexts] || savedPlacesTexts.EN,
    [language]
  );

  const handleRemove = (placeId: string) => {
    setPlaces((prev) => prev.filter((place) => place.id !== placeId));
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

          <div className="h-11 w-11" />
        </div>

        <div className="mt-6 space-y-4">
          {places.length === 0 && (
            <div className="rounded-[28px] border border-[#efe4d7] bg-white p-6 text-center text-sm font-medium text-[#7a7065] shadow-sm">
              {text.empty}
            </div>
          )}

          {places.map((place) => (
            <div
              key={place.id}
              className="rounded-[28px] border border-[#efe4d7] bg-white p-4 shadow-sm"
            >
              <div className="flex items-start gap-3">
                <img
                  src={place.image}
                  alt={place.title}
                  className="h-16 w-16 rounded-2xl object-cover"
                />

                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-base font-extrabold text-[#1d1712]">
                    {place.title}
                  </h2>
                  <p className="mt-1 text-sm text-[#6f6458]">{place.subtitle}</p>

                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      onClick={() => router.push('/')}
                      className="rounded-2xl bg-[#2f241c] px-4 py-2 text-xs font-bold text-white"
                    >
                      {text.openMap}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRemove(place.id)}
                      className="rounded-2xl border border-[#efe4d7] bg-white px-4 py-2 text-xs font-bold text-[#2f241c]"
                    >
                      {text.remove}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <BottomNav active="profile" />
    </main>
  );
}
