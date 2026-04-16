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
    quickAccess: 'Quick access to saved locations',
    trustedChoice: 'Trusted choice',
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
    trustedChoice: 'Elección confiable',
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
    trustedChoice: 'Надёжный выбор',
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
    trustedChoice: 'Důvěryhodná volba',
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
    trustedChoice: 'Vertrauenswürdige Wahl',
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
    trustedChoice: 'Zaufany wybór',
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
  if (kind === 'pink') return { background: '#fff0f6', color: '#ff4fa0' };
  if (kind === 'green') return { background: '#dff2e3', color: '#1d7a38' };
  if (kind === 'blue') return { background: '#e6efff', color: '#2559b7' };
  if (kind === 'orange') return { background: '#fff0da', color: '#c07a00' };
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
        background: '#ffffff',
        padding: '20px 16px 110px',
        fontFamily: 'Arial, sans-serif',
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
              border: '2px solid #111111',
              background: '#fff',
              fontSize: 26,
              fontWeight: 900,
              color: '#17130f',
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
                lineHeight: 1.1,
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
                lineHeight: 1.35,
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
            borderRadius: 30,
            border: '2px solid #111111',
            background: '#fff',
            padding: 18,
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr auto',
              gap: 14,
              alignItems: 'start',
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 900,
                  color: '#17130f',
                }}
              >
                {text.favouritePlaces}
              </div>
              <div
                style={{
                  marginTop: 6,
                  fontSize: 14,
                  color: '#7b7268',
                  fontWeight: 700,
                  lineHeight: 1.55,
                }}
              >
                {text.quickAccess}
              </div>
            </div>

            <div
              style={{
                minWidth: 90,
                borderRadius: 22,
                border: '2px solid #111111',
                background: '#fff0da',
                color: '#c07a00',
                padding: '12px 12px 10px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 28, fontWeight: 900, lineHeight: 1 }}>{places.length}</div>
              <div style={{ marginTop: 6, fontSize: 12, fontWeight: 900 }}>{text.savedCount}</div>
            </div>
          </div>

          <div
            style={{
              marginTop: 14,
              display: 'flex',
              flexWrap: 'wrap',
              gap: 10,
            }}
          >
            <span
              style={{
                ...accentStyle('orange'),
                borderRadius: 999,
                border: '2px solid #111111',
                padding: '9px 14px',
                fontSize: 12,
                fontWeight: 900,
              }}
            >
              📍 {places.length}
            </span>

            <span
              style={{
                ...accentStyle('blue'),
                borderRadius: 999,
                border: '2px solid #111111',
                padding: '9px 14px',
                fontSize: 12,
                fontWeight: 900,
              }}
            >
              {text.trustedChoice}
            </span>
          </div>
        </div>

        <div style={{ marginTop: 18, display: 'grid', gap: 16 }}>
          {places.length === 0 && (
            <div
              style={{
                borderRadius: 30,
                border: '2px solid #111111',
                background: '#fff',
                padding: 24,
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  width: 64,
                  height: 64,
                  margin: '0 auto 14px',
                  borderRadius: 22,
                  border: '2px solid #111111',
                  background: '#fff0da',
                  color: '#c07a00',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 28,
                }}
              >
                📍
              </div>

              <div
                style={{
                  fontSize: 18,
                  fontWeight: 900,
                  color: '#17130f',
                }}
              >
                {text.empty}
              </div>

              <div
                style={{
                  marginTop: 8,
                  fontSize: 14,
                  lineHeight: 1.6,
                  color: '#7a7065',
                  fontWeight: 700,
                }}
              >
                {text.emptySub}
              </div>
            </div>
          )}

          {places.map((place, index) => (
            <div
              key={place.id}
              style={{
                borderRadius: 30,
                border: '2px solid #111111',
                background: '#fff',
                padding: 16,
              }}
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '96px 1fr',
                  gap: 14,
                  alignItems: 'start',
                }}
              >
                <div style={{ position: 'relative' }}>
                  <img
                    src={place.image}
                    alt={place.title}
                    style={{
                      width: 96,
                      height: 96,
                      borderRadius: 24,
                      objectFit: 'cover',
                      display: 'block',
                      border: '2px solid #111111',
                    }}
                  />

                  <div
                    style={{
                      position: 'absolute',
                      right: -4,
                      bottom: -4,
                      width: 28,
                      height: 28,
                      borderRadius: 999,
                      background: '#2fa35a',
                      border: '3px solid #ffffff',
                    }}
                  />
                </div>

                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'start',
                      justifyContent: 'space-between',
                      gap: 10,
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 19,
                          fontWeight: 900,
                          color: '#17130f',
                          lineHeight: 1.15,
                        }}
                      >
                        {place.title}
                      </div>

                      <div
                        style={{
                          marginTop: 6,
                          fontSize: 14,
                          color: '#7b7268',
                          fontWeight: 700,
                        }}
                      >
                        {place.subtitle}
                      </div>
                    </div>

                    <div
                      style={{
                        ...accentStyle(index % 2 === 0 ? 'blue' : 'green'),
                        borderRadius: 18,
                        border: '2px solid #111111',
                        padding: '10px 12px',
                        fontSize: 12,
                        fontWeight: 900,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {text.nearby}
                    </div>
                  </div>

                  <div
                    style={{
                      marginTop: 12,
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 8,
                    }}
                  >
                    <span
                      style={{
                        ...accentStyle('orange'),
                        borderRadius: 999,
                        border: '2px solid #111111',
                        padding: '8px 12px',
                        fontSize: 12,
                        fontWeight: 900,
                      }}
                    >
                      {text.city}
                    </span>

                    <span
                      style={{
                        ...accentStyle('blue'),
                        borderRadius: 999,
                        border: '2px solid #111111',
                        padding: '8px 12px',
                        fontSize: 12,
                        fontWeight: 900,
                      }}
                    >
                      {place.lat.toFixed(3)}, {place.lng.toFixed(3)}
                    </span>
                  </div>

                  <div
                    style={{
                      marginTop: 14,
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr 1fr',
                      gap: 10,
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => router.push('/')}
                      style={{
                        border: '2px solid #111111',
                        borderRadius: 18,
                        background: 'linear-gradient(180deg, #2b221c 0%, #1f1712 100%)',
                        color: '#fff',
                        minHeight: 52,
                        padding: '0 12px',
                        fontSize: 13,
                        fontWeight: 900,
                        cursor: 'pointer',
                      }}
                    >
                      {text.openMap}
                    </button>

                    <button
                      type="button"
                      style={{
                        border: '2px solid #111111',
                        borderRadius: 18,
                        background: '#e6efff',
                        color: '#2559b7',
                        minHeight: 52,
                        padding: '0 12px',
                        fontSize: 13,
                        fontWeight: 900,
                        cursor: 'pointer',
                      }}
                    >
                      {text.route}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRemove(place.id)}
                      style={{
                        border: '2px solid #111111',
                        borderRadius: 18,
                        background: '#fff0f6',
                        color: '#ff4fa0',
                        minHeight: 52,
                        padding: '0 12px',
                        fontSize: 13,
                        fontWeight: 900,
                        cursor: 'pointer',
                      }}
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
