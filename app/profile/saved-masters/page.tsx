'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import BottomNav from '../../../components/common/BottomNav';
import { getSavedLanguage, type AppLanguage } from '../../services/i18n';
import { getAllMasters } from '../../services/masters';
import {
  getLikedMasterIds,
  subscribeToLikedMasters,
  toggleLikedMaster,
} from '../../services/likedMastersStore';

const savedMastersTexts = {
  EN: {
    title: 'Saved masters',
    empty: 'You have no saved masters yet',
    categoryFallback: 'Specialist',
    openProfile: 'Open profile',
    remove: 'Remove',
  },
  ES: {
    title: 'Profesionales guardados',
    empty: 'Todavía no tienes profesionales guardados',
    categoryFallback: 'Especialista',
    openProfile: 'Abrir perfil',
    remove: 'Eliminar',
  },
  RU: {
    title: 'Сохранённые мастера',
    empty: 'У вас пока нет сохранённых мастеров',
    categoryFallback: 'Специалист',
    openProfile: 'Открыть профиль',
    remove: 'Убрать',
  },
  CZ: {
    title: 'Uložení specialisté',
    empty: 'Zatím nemáte uložené specialisty',
    categoryFallback: 'Specialista',
    openProfile: 'Otevřít profil',
    remove: 'Odebrat',
  },
  DE: {
    title: 'Gespeicherte Profis',
    empty: 'Du hast noch keine gespeicherten Profis',
    categoryFallback: 'Spezialist',
    openProfile: 'Profil öffnen',
    remove: 'Entfernen',
  },
  PL: {
    title: 'Zapisani specjaliści',
    empty: 'Nie masz jeszcze zapisanych specjalistów',
    categoryFallback: 'Specjalista',
    openProfile: 'Otwórz profil',
    remove: 'Usuń',
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
};

export default function SavedMastersPage() {
  const router = useRouter();

  const [language, setLanguage] = useState<AppLanguage>('EN');
  const [likedIds, setLikedIds] = useState<(string | number)[]>(getLikedMasterIds());

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

  const text = useMemo(
    () => savedMastersTexts[language as keyof typeof savedMastersTexts] || savedMastersTexts.EN,
    [language]
  );

  const allMasters = getAllMasters() as SavedMasterItem[];

  const savedMasters = useMemo(() => {
    const likedSet = new Set(likedIds);
    return allMasters.filter((master) => likedSet.has(master.id));
  }, [allMasters, likedIds]);

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
          {savedMasters.length === 0 && (
            <div className="rounded-[28px] border border-[#efe4d7] bg-white p-6 text-center text-sm font-medium text-[#7a7065] shadow-sm">
              {text.empty}
            </div>
          )}

          {savedMasters.map((master) => (
            <div
              key={master.id}
              className="rounded-[28px] border border-[#efe4d7] bg-white p-4 shadow-sm"
            >
              <div className="flex items-start gap-3">
                <img
                  src={
                    master.avatar ||
                    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80'
                  }
                  alt={master.name || 'Master'}
                  className="h-16 w-16 rounded-2xl object-cover"
                />

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="truncate text-base font-extrabold text-[#1d1712]">
                        {master.name || master.title || text.categoryFallback}
                      </h2>
                      <p className="mt-1 text-sm text-[#6f6458]">
                        {master.category || text.categoryFallback}
                      </p>
                      <p className="mt-1 text-xs text-[#8a7d70]">
                        {master.city || 'London'}
                      </p>
                    </div>

                    {typeof master.rating === 'number' && (
                      <div className="rounded-full bg-[#f4ecdf] px-2.5 py-1 text-xs font-bold text-[#5e5145]">
                        ★ {master.rating.toFixed(1)}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      onClick={() => router.push(`/master/${master.id}`)}
                      className="rounded-2xl bg-[#2f241c] px-4 py-2 text-xs font-bold text-white"
                    >
                      {text.openProfile}
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleLikedMaster(master.id)}
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
