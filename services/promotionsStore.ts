export type PromotionStatus = 'draft' | 'active' | 'expired' | 'paused';

export type PromotionItem = {
  id: string;
  masterId: string;
  title: string;
  subtitle?: string;
  image: string;
  categoryId: string;
  centerLat: number;
  centerLng: number;
  radiusKm: number;
  startAt: string;
  endAt: string;
  createdAt: string;
  status: PromotionStatus;
  views: number;
};

type PromotionsListener = () => void;

const STORAGE_KEY = 'mapbook_promotions_store';

const listeners = new Set<PromotionsListener>();

const defaultPromotions: PromotionItem[] = [
  {
    id: 'promo-1',
    masterId: 'master-keratin-1',
    title: 'Keratin Hair Extensions',
    subtitle: '20% off this week',
    image:
      'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1200&q=80',
    categoryId: 'beauty',
    centerLat: 51.5074,
    centerLng: -0.1278,
    radiusKm: 15,
    startAt: '2026-04-01T08:00:00.000Z',
    endAt: '2027-12-31T20:00:00.000Z',
    createdAt: '2026-04-08T07:30:00.000Z',
    status: 'active',
    views: 184,
  },
  {
    id: 'promo-2',
    masterId: 'master-barber-1',
    title: 'Barber Fade + Beard',
    subtitle: 'From £25 today',
    image:
      'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=1200&q=80',
    categoryId: 'barber',
    centerLat: 51.5154,
    centerLng: -0.141,
    radiusKm: 10,
    startAt: '2026-04-01T09:00:00.000Z',
    endAt: '2027-12-31T21:00:00.000Z',
    createdAt: '2026-04-08T08:10:00.000Z',
    status: 'active',
    views: 96,
  },
  {
    id: 'promo-3',
    masterId: 'master-massage-1',
    title: 'Relax Massage Session',
    subtitle: 'Free aromatherapy upgrade',
    image:
      'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=1200&q=80',
    categoryId: 'wellness',
    centerLat: 51.5099,
    centerLng: -0.1181,
    radiusKm: 8,
    startAt: '2026-04-01T10:00:00.000Z',
    endAt: '2027-12-31T18:00:00.000Z',
    createdAt: '2026-04-08T08:40:00.000Z',
    status: 'active',
    views: 71,
  },
];

function emitChange() {
  listeners.forEach((listener) => listener());
}

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function readStore(): PromotionItem[] {
  if (!canUseStorage()) {
    return defaultPromotions;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultPromotions));
    return defaultPromotions;
  }

  try {
    const parsed = JSON.parse(raw) as PromotionItem[];

    if (!Array.isArray(parsed) || parsed.length === 0) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultPromotions));
      return defaultPromotions;
    }

    return parsed;
  } catch {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultPromotions));
    return defaultPromotions;
  }
}

function writeStore(items: PromotionItem[]) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  emitChange();
}

function toTime(value: string) {
  return new Date(value).getTime();
}

function isPromotionLive(item: PromotionItem, now = Date.now()) {
  if (item.status !== 'active') return false;

  const start = toTime(item.startAt);
  const end = toTime(item.endAt);

  if (Number.isNaN(start) || Number.isNaN(end)) return false;

  return now >= start && now <= end;
}

function degreesToRadians(value: number) {
  return (value * Math.PI) / 180;
}

function getDistanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
) {
  const earthRadiusKm = 6371;

  const dLat = degreesToRadians(lat2 - lat1);
  const dLng = degreesToRadians(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(degreesToRadians(lat1)) *
      Math.cos(degreesToRadians(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusKm * c;
}

function isInsidePromotionRadius(
  item: PromotionItem,
  userLat: number,
  userLng: number
) {
  const distance = getDistanceKm(
    userLat,
    userLng,
    item.centerLat,
    item.centerLng
  );

  return distance <= item.radiusKm;
}

export function getPromotions() {
  return readStore().sort((a, b) => toTime(a.createdAt) - toTime(b.createdAt));
}

export function getPromotionById(id: string) {
  return readStore().find((item) => item.id === id) || null;
}

export function getActivePromotions() {
  const now = Date.now();

  return readStore()
    .filter((item) => isPromotionLive(item, now))
    .sort((a, b) => toTime(a.createdAt) - toTime(b.createdAt));
}

export function getVisiblePromotionsForLocation(
  userLat: number,
  userLng: number,
  categoryId?: string
) {
  const normalizedCategory = String(categoryId || '').toLowerCase().trim();
  const active = getActivePromotions();

  const categoryItems = normalizedCategory
    ? active.filter((item) => item.categoryId.toLowerCase() === normalizedCategory)
    : active;

  const inRadius = categoryItems.filter((item) =>
    isInsidePromotionRadius(item, userLat, userLng)
  );

  if (inRadius.length > 0) {
    return inRadius.sort((a, b) => toTime(a.createdAt) - toTime(b.createdAt));
  }

  if (categoryItems.length > 0) {
    return categoryItems.sort((a, b) => toTime(a.createdAt) - toTime(b.createdAt));
  }

  return active.sort((a, b) => toTime(a.createdAt) - toTime(b.createdAt));
}

export function addPromotion(item: PromotionItem) {
  const current = readStore();
  writeStore([...current, item]);
}

export function updatePromotion(id: string, updates: Partial<PromotionItem>) {
  const current = readStore();
  const next = current.map((item) =>
    item.id === id ? { ...item, ...updates } : item
  );
  writeStore(next);
}

export function incrementPromotionViews(id: string) {
  const current = readStore();
  const next = current.map((item) =>
    item.id === id ? { ...item, views: item.views + 1 } : item
  );
  writeStore(next);
}

export function subscribeToPromotionsStore(listener: PromotionsListener) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

export function resetPromotionsStore() {
  writeStore(defaultPromotions);
}
