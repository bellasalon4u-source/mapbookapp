'use client';

const STORAGE_KEY = 'mapbook-liked-master-ids';

type Listener = () => void;

let listeners: Listener[] = [];

function notify() {
  listeners.forEach((listener) => listener());
}

export function getLikedMasterIds(): string[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

export function setLikedMasterIds(ids: string[]) {
  if (typeof window === 'undefined') return;

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids.map(String)));
  notify();
}

export function toggleLikedMaster(masterId: string | number) {
  const id = String(masterId);
  const current = getLikedMasterIds();

  const next = current.includes(id)
    ? current.filter((item) => item !== id)
    : [...current, id];

  setLikedMasterIds(next);
}

export function isMasterLiked(masterId: string | number): boolean {
  return getLikedMasterIds().includes(String(masterId));
}

export function subscribeToLikedMasters(listener: Listener) {
  listeners.push(listener);

  return () => {
    listeners = listeners.filter((item) => item !== listener);
  };
}
