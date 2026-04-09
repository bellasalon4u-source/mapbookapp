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
  description?: string;
  included?: string[];
  oldPrice?: string;
  newPrice?: string;
  validUntil?: string;
  area?: string;
  address?: string;
  distance?: string;
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
    description:
      'Get a professional keratin hair extensions service with a personalised consultation, colour match and a natural blend finish. Perfect for clients who want extra length, extra volume and a seamless result.',
    included: [
      'Personal consultation',
      'Colour matching',
      'Keratin extension application',
      'Blend cut and styling',
      'Aftercare advice',
    ],
    oldPrice: '£150',
    newPrice: '£120',
    validUntil: '20 April',
    area: 'Camden, London',
    address: '24 Camden High Street, London',
    distance: '1.2 miles away',
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
    description:
      'Fresh barber fade with beard shaping for a clean modern look. Ideal for a quick refresh before work, events or weekends.',
    included: [
      'Skin fade or taper fade',
      'Beard shaping',
      'Neck clean-up',
      'Styling finish',
    ],
    oldPrice: '£35',
    newPrice: '£25',
    validUntil: 'Today',
    area: 'Soho, London',
    address: '18 Wardour Street, London',
    distance: '0.8 miles away',
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
    description:
      'A calming massage session designed to help you relax, release tension and reset. Includes a complimentary aromatherapy upgrade.',
    included: [
      '60-minute massage',
      'Aromatherapy upgrade',
      'Relaxing treatment room',
      'Aftercare tips',
    ],
    oldPrice: '£70',
    newPrice: '£60',
    validUntil: 'This week',
    area: 'Covent Garden, London',
    address: '12 Floral Street, London',
    distance: '1.5 miles away',
  },
];

function emitChange() {
  listeners.forEach((listener) => listener());
}

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function normalizePromotion(item: PromotionItem): PromotionItem {
  return {
    ...item,
    description: item.description || '',
    included: Array.isArray(item.included) ? item.included : [],
    oldPrice: item.oldPrice || '',
    newPrice: item.newPrice || '',
    validUntil: item.validUntil || '',
    area: item.area || '',
    address: item.address || '',
    distance: item.distance || '',
  };
}

function readStore(): PromotionItem[] {
  if (!canUseStorage()) {
    return defaultPromotions.map(normalizePromotion);
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultPromotions));
    return defaultPromotions.map(normalizePromotion);
  }

  try {
    const parsed = JSON.parse(raw) as PromotionItem[];

    if (!Array.isArray(parsed) || parsed.length === 0) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultPromotions));
      return defaultPromotions.map(normalizePromotion);
    }

    return parsed.map(normalizePromotion);
  } catch {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultPromotions));
    return defaultPromotions.map(normalizePromotion);
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
  writeStore([...current, normalizePromotion(item)]);
}

export function updatePromotion(id: string, updates: Partial<PromotionItem>) {
  const current = readStore();
  const next = current.map((item) =>
    item.id === id ? normalizePromotion({ ...item, ...updates }) : item
  );
  writeStore(next);
}

export function incrementPromotionViews(id: string, amount = 1) {
  if (amount <= 0) return;

  const current = readStore();
  const next = current.map((item) =>
    item.id === id ? { ...item, views: item.views + amount } : item
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
  writeStore(defaultPromotions.map(normalizePromotion));
}
