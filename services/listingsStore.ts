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
    telegram: string;
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

function readListings(): ListingItem[] {
  if (!canUseStorage()) return [];

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
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
