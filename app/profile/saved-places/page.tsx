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
            borderRadius: 30,
            border: '1px solid #f0e3d7',
            background: 'linear-gradient(180deg, #ffffff 0%, #fff8f8 100%)',
            padding: 18,
            boxShadow: '0 12px 28px rgba(44, 23, 10, 0.05)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 14,
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
                {text.savedCount}
              </div>
              <div
                style={{
                  marginTop: 6,
                  fontSize: 14,
                  color: '#7b7268',
                  fontWeight: 700,
                }}
              >
                {places.length}
              </div>
            </div>

            <div
              style={{
                ...accentStyle('orange'),
                borderRadius: 999,
                padding: '10px 14px',
                fontSize: 13,
                fontWeight: 900,
                whiteSpace: 'nowrap',
              }}
            >
              📍 {places.length}
            </div>
          </div>
        </div>

        <div style={{ marginTop: 18, display: 'grid', gap: 14 }}>
          {places.length === 0 && (
            <div
              style={{
                borderRadius: 30,
                border: '1px solid #efe4d7',
                background: '#fff',
                padding: 24,
                textAlign: 'center',
                boxShadow: '0 12px 28px rgba(44, 23, 10, 0.05)',
              }}
            >
              <div
                style={{
                  width: 64,
                  height: 64,
                  margin: '0 auto 14px',
                  borderRadius: 22,
                  background: '#fff5e8',
                  color: '#d68612',
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
                border: '1px solid #efe4d7',
                background: '#fff',
                padding: 16,
                boxShadow: '0 12px 28px rgba(44, 23, 10, 0.05)',
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
                      boxShadow: '0 10px 22px rgba(44, 23, 10, 0.10)',
                    }}
                  />

                  <div
                    style={{
                      position: 'absolute',
                      right: -3,
                      bottom: -3,
                      width: 26,
                      height: 26,
                      borderRadius: 999,
                      background: '#2fa35a',
                      border: '3px solid #fff',
                      boxShadow: '0 6px 14px rgba(47,163,90,0.22)',
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
                        borderRadius: 16,
                        padding: '9px 12px',
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
                        border: 'none',
                        borderRadius: 18,
                        background: 'linear-gradient(180deg, #2b221c 0%, #1f1712 100%)',
                        color: '#fff',
                        minHeight: 48,
                        padding: '0 12px',
                        fontSize: 13,
                        fontWeight: 900,
                        cursor: 'pointer',
                        boxShadow: '0 12px 24px rgba(31,23,18,0.18)',
                      }}
                    >
                      {text.openMap}
                    </button>

                    <button
                      type="button"
                      style={{
                        border: '1px solid #dce8ff',
                        borderRadius: 18,
                        background: '#eef4ff',
                        color: '#2f7cf6',
                        minHeight: 48,
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
                        border: '1px solid #f1d9e6',
                        borderRadius: 18,
                        background: '#fff1f7',
                        color: '#ff4fa0',
                        minHeight: 48,
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
