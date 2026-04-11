'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import BottomNav from '../../../components/common/BottomNav';
import { getSavedLanguage, type AppLanguage } from '../../../services/i18n';

const savedPlacesTexts = {
  EN: {
    title: 'Saved places',
    subtitle: 'Favourite places you want to return to',
    empty: 'You have no saved places yet',
    emptySub: 'Save locations from the map and they will appear here.',
    openMap: 'Open on map',
    remove: 'Remove',
    savedCount: 'Saved',
    route: 'Build route',
    nearby: 'Nearby',
    city: 'City',
    favouritePlaces: 'Favourite places',
    quickAccess: 'Quick access to saved map locations',
    trustedPlace: 'Saved location',
  },
  ES: {
    title: 'Lugares guardados',
    subtitle: 'Lugares favoritos a los que quieres volver',
    empty: 'Todavía no tienes lugares guardados',
    emptySub: 'Guarda ubicaciones del mapa y aparecerán aquí.',
    openMap: 'Abrir en mapa',
    remove: 'Eliminar',
    savedCount: 'Guardados',
    route: 'Crear ruta',
    nearby: 'Cerca',
    city: 'Ciudad',
    favouritePlaces: 'Lugares favoritos',
    quickAccess: 'Acceso rápido a ubicaciones guardadas',
    trustedPlace: 'Ubicación guardada',
  },
  RU: {
    title: 'Сохранённые места',
    subtitle: 'Любимые места, к которым вы хотите вернуться',
    empty: 'У вас пока нет сохранённых мест',
    emptySub: 'Сохраняйте локации с карты, и они появятся здесь.',
    openMap: 'Открыть на карте',
    remove: 'Убрать',
    savedCount: 'Сохранено',
    route: 'Построить маршрут',
    nearby: 'Рядом',
    city: 'Город',
    favouritePlaces: 'Избранные места',
    quickAccess: 'Быстрый доступ к сохранённым локациям',
    trustedPlace: 'Сохранённая локация',
  },
  CZ: {
    title: 'Uložená místa',
    subtitle: 'Oblíbená místa, kam se chcete vrátit',
    empty: 'Zatím nemáte uložená místa',
    emptySub: 'Uložte si místa z mapy a objeví se zde.',
    openMap: 'Otevřít na mapě',
    remove: 'Odebrat',
    savedCount: 'Uloženo',
    route: 'Naplánovat trasu',
    nearby: 'Blízko',
    city: 'Město',
    favouritePlaces: 'Oblíbená místa',
    quickAccess: 'Rychlý přístup k uloženým místům',
    trustedPlace: 'Uložená lokalita',
  },
  DE: {
    title: 'Gespeicherte Orte',
    subtitle: 'Lieblingsorte, zu denen du zurückkehren möchtest',
    empty: 'Du hast noch keine gespeicherten Orte',
    emptySub: 'Speichere Orte von der Karte und sie erscheinen hier.',
    openMap: 'Auf Karte öffnen',
    remove: 'Entfernen',
    savedCount: 'Gespeichert',
    route: 'Route planen',
    nearby: 'In der Nähe',
    city: 'Stadt',
    favouritePlaces: 'Lieblingsorte',
    quickAccess: 'Schnellzugriff auf gespeicherte Orte',
    trustedPlace: 'Gespeicherter Ort',
  },
  PL: {
    title: 'Zapisane miejsca',
    subtitle: 'Ulubione miejsca, do których chcesz wrócić',
    empty: 'Nie masz jeszcze zapisanych miejsc',
    emptySub: 'Zapisuj lokalizacje z mapy, a pojawią się tutaj.',
    openMap: 'Otwórz na mapie',
    remove: 'Usuń',
    savedCount: 'Zapisane',
    route: 'Wyznacz trasę',
    nearby: 'W pobliżu',
    city: 'Miasto',
    favouritePlaces: 'Ulubione miejsca',
    quickAccess: 'Szybki dostęp do zapisanych lokalizacji',
    trustedPlace: 'Zapisana lokalizacja',
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

function accentStyle(kind: 'pink' | 'green' | 'blue' | 'orange' | 'neutral') {
  if (kind === 'pink') return { background: '#fff1f7', color: '#ff4fa0' };
  if (kind === 'green') return { background: '#eef9f1', color: '#2fa35a' };
  if (kind === 'blue') return { background: '#eef4ff', color: '#2f7cf6' };
  if (kind === 'orange') return { background: '#fff5e8', color: '#d68612' };
  return { background: '#f4efe8', color: '#6d6258' };
}

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
