'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import BottomNav from '../../../components/common/BottomNav';
import { getSavedLanguage, type AppLanguage } from '../../../services/i18n';
import { getAllMasters } from '../../../services/masters';
import {
  getLikedMasterIds,
  subscribeToLikedMasters,
  toggleLikedMaster,
} from '../../../services/likedMastersStore';

const savedMastersTexts = {
  EN: {
    title: 'Saved masters',
    subtitle: 'Professionals you liked and want to return to',
    empty: 'You have no saved masters yet',
    emptySub: 'Save professionals you like and they will appear here.',
    categoryFallback: 'Specialist',
    openProfile: 'Open profile',
    remove: 'Remove',
    savedCount: 'Saved',
    ratingLabel: 'Rating',
    cityFallback: 'London',
    availableNow: 'Available now',
  },
  ES: {
    title: 'Profesionales guardados',
    subtitle: 'Profesionales que te gustaron y a los que quieres volver',
    empty: 'Todavía no tienes profesionales guardados',
    emptySub: 'Guarda los profesionales que te gusten y aparecerán aquí.',
    categoryFallback: 'Especialista',
    openProfile: 'Abrir perfil',
    remove: 'Eliminar',
    savedCount: 'Guardados',
    ratingLabel: 'Valoración',
    cityFallback: 'London',
    availableNow: 'Disponible ahora',
  },
  RU: {
    title: 'Сохранённые мастера',
    subtitle: 'Мастера, которые вам понравились и к которым можно вернуться',
    empty: 'У вас пока нет сохранённых мастеров',
    emptySub: 'Сохраняйте понравившихся мастеров, и они появятся здесь.',
    categoryFallback: 'Специалист',
    openProfile: 'Открыть профиль',
    remove: 'Убрать',
    savedCount: 'Сохранено',
    ratingLabel: 'Рейтинг',
    cityFallback: 'London',
    availableNow: 'Доступен сейчас',
  },
  CZ: {
    title: 'Uložení specialisté',
    subtitle: 'Specialisté, kteří se vám líbili a ke kterým se můžete vrátit',
    empty: 'Zatím nemáte uložené specialisty',
    emptySub: 'Uložte si oblíbené specialisty a objeví se zde.',
    categoryFallback: 'Specialista',
    openProfile: 'Otevřít profil',
    remove: 'Odebrat',
    savedCount: 'Uloženo',
    ratingLabel: 'Hodnocení',
    cityFallback: 'London',
    availableNow: 'Dostupný nyní',
  },
  DE: {
    title: 'Gespeicherte Profis',
    subtitle: 'Profis, die dir gefallen haben und zu denen du zurückkehren kannst',
    empty: 'Du hast noch keine gespeicherten Profis',
    emptySub: 'Speichere Profis, die dir gefallen, und sie erscheinen hier.',
    categoryFallback: 'Spezialist',
    openProfile: 'Profil öffnen',
    remove: 'Entfernen',
    savedCount: 'Gespeichert',
    ratingLabel: 'Bewertung',
    cityFallback: 'London',
    availableNow: 'Jetzt verfügbar',
  },
  PL: {
    title: 'Zapisani specjaliści',
    subtitle: 'Specjaliści, którzy Ci się spodobali i do których możesz wrócić',
    empty: 'Nie masz jeszcze zapisanych specjalistów',
    emptySub: 'Zapisuj ulubionych specjalistów, a pojawią się tutaj.',
    categoryFallback: 'Specjalista',
    openProfile: 'Otwórz profil',
    remove: 'Usuń',
    savedCount: 'Zapisane',
    ratingLabel: 'Ocena',
    cityFallback: 'London',
    availableNow: 'Dostępny teraz',
  },
} as const;

type SavedMasterItem = {
  id: string | number;
  name?: string;
  title?: string;
  category?: string;
  city?: string;
  rating?: number;
  avatar?: string;
  availableNow?: boolean;
};

function accentStyle(kind: 'pink' | 'green' | 'blue' | 'orange' | 'neutral') {
  if (kind === 'pink') return { background: '#fff1f7', color: '#ff4fa0' };
  if (kind === 'green') return { background: '#eef9f1', color: '#2fa35a' };
  if (kind === 'blue') return { background: '#eef4ff', color: '#2f7cf6' };
  if (kind === 'orange') return { background: '#fff5e8', color: '#d68612' };
  return { background: '#f4efe8', color: '#6d6258' };
}

export default function SavedMastersPage() {
  const router = useRouter();

  const [language, setLanguage] = useState<AppLanguage>('EN');
  const [likedIds, setLikedIds] = useState<(string | number)[]>([]);

  useEffect(() => {
    const syncLanguage = () => {
      setLanguage(getSavedLanguage());
    };

    const syncLikedMasters = () => {
      setLikedIds(getLikedMasterIds());
    };

    syncLanguage();
    syncLikedMasters();

    window.addEventListener('focus', syncLanguage);
    const unsubLiked = subscribeToLikedMasters(syncLikedMasters);

    return () => {
      window.removeEventListener('focus', syncLanguage);
      unsubLiked();
    };
  }, []);

  const text =
    savedMastersTexts[language as keyof typeof savedMastersTexts] ||
    savedMastersTexts.EN;

  const allMasters = getAllMasters() as SavedMasterItem[];

  const savedMasters = useMemo(() => {
    const likedSet = new Set(likedIds);
    return allMasters.filter((master) => likedSet.has(master.id));
  }, [allMasters, likedIds]);

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
                {savedMasters.length}
              </div>
            </div>

            <div
              style={{
                ...accentStyle('pink'),
                borderRadius: 999,
                padding: '10px 14px',
                fontSize: 13,
                fontWeight: 900,
                whiteSpace: 'nowrap',
              }}
            >
              ❤️ {savedMasters.length}
            </div>
          </div>
        </div>

        <div style={{ marginTop: 18, display: 'grid', gap: 14 }}>
          {savedMasters.length === 0 && (
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
                  background: '#fff1f7',
                  color: '#ff4fa0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 28,
                }}
              >
                ❤️
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

          {savedMasters.map((master, index) => (
            <div
              key={master.id}
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
                  gridTemplateColumns: '88px 1fr',
                  gap: 14,
                  alignItems: 'start',
                }}
              >
                <div style={{ position: 'relative' }}>
                  <img
                    src={
                      master.avatar ||
                      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80'
                    }
                    alt={master.name || 'Master'}
                    style={{
                      width: 88,
                      height: 88,
                      borderRadius: 24,
                      objectFit: 'cover',
                      display: 'block',
                      boxShadow: '0 10px 22px rgba(44, 23, 10, 0.10)',
                    }}
                  />

                  {master.availableNow && (
                    <div
                      style={{
                        position: 'absolute',
                        right: -3,
                        bottom: -3,
                        width: 24,
                        height: 24,
                        borderRadius: 999,
                        background: '#2fa35a',
                        border: '3px solid #fff',
                        boxShadow: '0 6px 14px rgba(47,163,90,0.22)',
                      }}
                    />
                  )}
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
                        {master.name || master.title || text.categoryFallback}
                      </div>

                      <div
                        style={{
                          marginTop: 6,
                          fontSize: 14,
                          color: '#7b7268',
                          fontWeight: 700,
                        }}
                      >
                        {master.category || text.categoryFallback}
                      </div>

                      <div
                        style={{
                          marginTop: 4,
                          fontSize: 13,
                          color: '#8a7d70',
                          fontWeight: 700,
                        }}
                      >
                        {master.city || text.cityFallback}
                      </div>
                    </div>

                    {typeof master.rating === 'number' && (
                      <div
                        style={{
                          ...accentStyle(index % 2 === 0 ? 'orange' : 'green'),
                          borderRadius: 16,
                          padding: '9px 12px',
                          fontSize: 13,
                          fontWeight: 900,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        ★ {master.rating.toFixed(1)}
                      </div>
                    )}
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
                        ...accentStyle('blue'),
                        borderRadius: 999,
                        padding: '8px 12px',
                        fontSize: 12,
                        fontWeight: 900,
                      }}
                    >
                      {text.ratingLabel}
                    </span>

                    {master.availableNow && (
                      <span
                        style={{
                          ...accentStyle('green'),
                          borderRadius: 999,
                          padding: '8px 12px',
                          fontSize: 12,
                          fontWeight: 900,
                        }}
                      >
                        {text.availableNow}
                      </span>
                    )}
                  </div>

                  <div
                    style={{
                      marginTop: 14,
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: 10,
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => router.push(`/master/${master.id}`)}
                      style={{
                        border: 'none',
                        borderRadius: 18,
                        background: 'linear-gradient(180deg, #2b221c 0%, #1f1712 100%)',
                        color: '#fff',
                        minHeight: 48,
                        padding: '0 14px',
                        fontSize: 14,
                        fontWeight: 900,
                        cursor: 'pointer',
                        boxShadow: '0 12px 24px rgba(31,23,18,0.18)',
                      }}
                    >
                      {text.openProfile}
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleLikedMaster(master.id)}
                      style={{
                        border: '1px solid #f1d9e6',
                        borderRadius: 18,
                        background: '#fff1f7',
                        color: '#ff4fa0',
                        minHeight: 48,
                        padding: '0 14px',
                        fontSize: 14,
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
