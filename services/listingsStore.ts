export type PaymentMethod = 'cash' | 'card' | 'wallet';

export type ServiceMode = 'at_client' | 'at_my_place' | 'online';

export type ListingItem = {
  id: string;
  title: string;
  description: string;
  category: string;
  subcategory: string;
  price: string;
  location: string;
  hours: string;
  availableToday: boolean;
  serviceModes: ServiceMode[];
  paymentMethods: PaymentMethod[];
  contact: {
    phone: string;
    whatsapp: string;
    businessWhatsapp: string;
    telegram: string;
    viber: string;
    instagram: string;
    website: string;
    email: string;
  };
  photos: string[];
  createdAt: string;
};

const STORAGE_KEY = 'mapbook_listings_store_v1';

type Listener = () => void;

let listeners: Listener[] = [];

function notify() {
  listeners.forEach((listener) => listener());
}

function canUseStorage() {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

function normalizeListing(raw: any): ListingItem | null {
  if (!raw || typeof raw !== 'object') return null;

  return {
    id: String(raw.id || ''),
    title: String(raw.title || ''),
    description: String(raw.description || ''),
    category: String(raw.category || ''),
    subcategory: String(raw.subcategory || ''),
    price: String(raw.price || ''),
    location: String(raw.location || ''),
    hours: String(raw.hours || ''),
    availableToday: Boolean(raw.availableToday),
    serviceModes: Array.isArray(raw.serviceModes)
      ? raw.serviceModes.filter((item: unknown) =>
          item === 'at_client' || item === 'at_my_place' || item === 'online'
        )
      : [],
    paymentMethods: Array.isArray(raw.paymentMethods)
      ? raw.paymentMethods.filter((item: unknown) =>
          item === 'cash' || item === 'card' || item === 'wallet'
        )
      : [],
    contact: {
      phone: String(raw.contact?.phone || ''),
      whatsapp: String(raw.contact?.whatsapp || ''),
      businessWhatsapp: String(raw.contact?.businessWhatsapp || ''),
      telegram: String(raw.contact?.telegram || ''),
      viber: String(raw.contact?.viber || ''),
      instagram: String(raw.contact?.instagram || ''),
      website: String(raw.contact?.website || ''),
      email: String(raw.contact?.email || ''),
    },
    photos: Array.isArray(raw.photos)
      ? raw.photos.filter((item: unknown) => typeof item === 'string')
      : [],
    createdAt: String(raw.createdAt || new Date().toISOString()),
  };
}

function readListings(): ListingItem[] {
  if (!canUseStorage()) return [];

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((item) => normalizeListing(item))
      .filter((item): item is ListingItem => item !== null);
  } catch {
    return [];
  }
}

function writeListings(items: ListingItem[]) {
  if (!canUseStorage()) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  notify();
}

export function getListings(): ListingItem[] {
  return readListings();
}

export function addListing(
  payload: Omit<ListingItem, 'id' | 'createdAt'>
): ListingItem {
  const newItem: ListingItem = {
    ...payload,
    contact: {
      phone: String(payload.contact?.phone || ''),
      whatsapp: String(payload.contact?.whatsapp || ''),
      businessWhatsapp: String(payload.contact?.businessWhatsapp || ''),
      telegram: String(payload.contact?.telegram || ''),
      viber: String(payload.contact?.viber || ''),
      instagram: String(payload.contact?.instagram || ''),
      website: String(payload.contact?.website || ''),
      email: String(payload.contact?.email || ''),
    },
    photos: Array.isArray(payload.photos) ? payload.photos : [],
    id: `listing_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
  };

  const current = readListings();
  writeListings([newItem, ...current]);
  return newItem;
}

export function subscribeToListingsStore(listener: Listener) {
  listeners.push(listener);

  return () => {
    listeners = listeners.filter((item) => item !== listener);
  };
}
