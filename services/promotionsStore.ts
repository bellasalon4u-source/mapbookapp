import { getSavedLanguage, type AppLanguage } from './i18n';

export type PromotionStatus = 'draft' | 'active' | 'expired' | 'paused';

type LocalizedText = string | Partial<Record<AppLanguage, string>>;
type LocalizedList = string[] | Partial<Record<AppLanguage, string[]>>;

export type PromotionRecord = {
  id: string;
  masterId: string;
  title: LocalizedText;
  subtitle?: LocalizedText;
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
  description?: LocalizedText;
  included?: LocalizedList;
  oldPrice?: string;
  newPrice?: string;
  validUntil?: LocalizedText;
  area?: LocalizedText;
  address?: LocalizedText;
  distance?: LocalizedText;
};

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

const defaultPromotions: PromotionRecord[] = [
  {
    id: 'promo-1',
    masterId: 'master-keratin-1',
    title: {
      EN: 'Keratin Hair Extensions',
      ES: 'Extensiones de cabello de queratina',
      RU: 'Кератиновое наращивание волос',
      CZ: 'Keratinové prodloužení vlasů',
      DE: 'Keratin-Haarverlängerung',
      PL: 'Keratinowe przedłużanie włosów',
    },
    subtitle: {
      EN: '20% off this week',
      ES: '20% de descuento esta semana',
      RU: 'Скидка 20% на этой неделе',
      CZ: '20% sleva tento týden',
      DE: '20 % Rabatt diese Woche',
      PL: '20% zniżki w tym tygodniu',
    },
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
    description: {
      EN: 'Get a professional keratin hair extensions service with a personalised consultation, colour match and a natural blend finish. Perfect for clients who want extra length, extra volume and a seamless result.',
      ES: 'Obtén un servicio profesional de extensiones de queratina con consulta personalizada, igualación de color y un acabado natural. Ideal para clientes que desean más largo, más volumen y un resultado uniforme.',
      RU: 'Профессиональное кератиновое наращивание волос с персональной консультацией, подбором цвета и натуральным финишем. Идеально для клиентов, которые хотят больше длины, объёма и максимально естественный результат.',
      CZ: 'Získejte profesionální keratinové prodloužení vlasů s osobní konzultací, sladěním barvy a přirozeným výsledkem. Ideální pro klienty, kteří chtějí větší délku, objem a hladký efekt.',
      DE: 'Professionelle Keratin-Haarverlängerung mit persönlicher Beratung, Farbabstimmung und natürlichem Finish. Perfekt für Kundinnen, die mehr Länge, mehr Volumen und ein nahtloses Ergebnis möchten.',
      PL: 'Profesjonalne keratynowe przedłużanie włosów z indywidualną konsultacją, doborem koloru i naturalnym efektem. Idealne dla klientek, które chcą większej długości, objętości i płynnego rezultatu.',
    },
    included: {
      EN: [
        'Personal consultation',
        'Colour matching',
        'Keratin extension application',
        'Blend cut and styling',
        'Aftercare advice',
      ],
      ES: [
        'Consulta personal',
        'Igualación de color',
        'Aplicación de extensiones de queratina',
        'Corte de integración y peinado',
        'Consejos de cuidado posterior',
      ],
      RU: [
        'Персональная консультация',
        'Подбор цвета',
        'Наращивание на кератин',
        'Стрижка для смешивания и укладка',
        'Рекомендации по уходу',
      ],
      CZ: [
        'Osobní konzultace',
        'Sladění barvy',
        'Aplikace keratinových pramenů',
        'Střih pro přirozené spojení a styling',
        'Doporučení pro následnou péči',
      ],
      DE: [
        'Persönliche Beratung',
        'Farbabstimmung',
        'Keratin-Extensions Anbringung',
        'Blending-Schnitt und Styling',
        'Pflegehinweise',
      ],
      PL: [
        'Konsultacja indywidualna',
        'Dobór koloru',
        'Aplikacja keratynowych pasm',
        'Cięcie wyrównujące i stylizacja',
        'Wskazówki pielęgnacyjne',
      ],
    },
    oldPrice: '£150',
    newPrice: '£120',
    validUntil: {
      EN: '20 April',
      ES: '20 de abril',
      RU: '20 апреля',
      CZ: '20. dubna',
      DE: '20. April',
      PL: '20 kwietnia',
    },
    area: {
      EN: 'Camden, London',
      ES: 'Camden, Londres',
      RU: 'Камден, Лондон',
      CZ: 'Camden, Londýn',
      DE: 'Camden, London',
      PL: 'Camden, Londyn',
    },
    address: {
      EN: '24 Camden High Street, London',
      ES: '24 Camden High Street, Londres',
      RU: '24 Camden High Street, Лондон',
      CZ: '24 Camden High Street, Londýn',
      DE: '24 Camden High Street, London',
      PL: '24 Camden High Street, Londyn',
    },
    distance: {
      EN: '1.2 miles away',
      ES: 'a 1.2 millas',
      RU: '1.2 мили от вас',
      CZ: '1,2 míle od vás',
      DE: '1,2 Meilen entfernt',
      PL: '1.2 mili od Ciebie',
    },
  },
  {
    id: 'promo-2',
    masterId: 'master-barber-1',
    title: {
      EN: 'Barber Fade + Beard',
      ES: 'Fade de barbería + barba',
      RU: 'Барбер fade + борода',
      CZ: 'Barber fade + vousy',
      DE: 'Barber Fade + Bart',
      PL: 'Barber fade + broda',
    },
    subtitle: {
      EN: 'From £25 today',
      ES: 'Desde £25 hoy',
      RU: 'От £25 сегодня',
      CZ: 'Od £25 dnes',
      DE: 'Heute ab £25',
      PL: 'Od £25 dzisiaj',
    },
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
    description: {
      EN: 'Fresh barber fade with beard shaping for a clean modern look. Ideal for a quick refresh before work, events or weekends.',
      ES: 'Fade limpio con perfilado de barba para un look moderno. Ideal para renovarte rápidamente antes del trabajo, eventos o fines de semana.',
      RU: 'Свежий барбер fade с оформлением бороды для чистого современного образа. Идеально для быстрого обновления перед работой, встречами или выходными.',
      CZ: 'Čerstvý barber fade s úpravou vousů pro čistý moderní vzhled. Ideální pro rychlé osvěžení před prací, akcí nebo víkendem.',
      DE: 'Frischer Barber Fade mit Bartformung für einen sauberen modernen Look. Ideal für ein schnelles Fresh-up vor Arbeit, Events oder dem Wochenende.',
      PL: 'Świeży barber fade z modelowaniem brody dla nowoczesnego wyglądu. Idealne szybkie odświeżenie przed pracą, wydarzeniem lub weekendem.',
    },
    included: {
      EN: ['Skin fade or taper fade', 'Beard shaping', 'Neck clean-up', 'Styling finish'],
      ES: ['Skin fade o taper fade', 'Perfilado de barba', 'Limpieza del cuello', 'Acabado de peinado'],
      RU: ['Skin fade или taper fade', 'Оформление бороды', 'Очистка шеи', 'Финишная укладка'],
      CZ: ['Skin fade nebo taper fade', 'Úprava vousů', 'Začištění krku', 'Finální styling'],
      DE: ['Skin Fade oder Taper Fade', 'Bartformung', 'Nackenreinigung', 'Styling-Finish'],
      PL: ['Skin fade lub taper fade', 'Modelowanie brody', 'Oczyszczenie karku', 'Wykończenie stylizacji'],
    },
    oldPrice: '£35',
    newPrice: '£25',
    validUntil: {
      EN: 'Today',
      ES: 'Hoy',
      RU: 'Сегодня',
      CZ: 'Dnes',
      DE: 'Heute',
      PL: 'Dzisiaj',
    },
    area: {
      EN: 'Soho, London',
      ES: 'Soho, Londres',
      RU: 'Сохо, Лондон',
      CZ: 'Soho, Londýn',
      DE: 'Soho, London',
      PL: 'Soho, Londyn',
    },
    address: {
      EN: '18 Wardour Street, London',
      ES: '18 Wardour Street, Londres',
      RU: '18 Wardour Street, Лондон',
      CZ: '18 Wardour Street, Londýn',
      DE: '18 Wardour Street, London',
      PL: '18 Wardour Street, Londyn',
    },
    distance: {
      EN: '0.8 miles away',
      ES: 'a 0.8 millas',
      RU: '0.8 мили от вас',
      CZ: '0,8 míle od vás',
      DE: '0,8 Meilen entfernt',
      PL: '0.8 mili od Ciebie',
    },
  },
  {
    id: 'promo-3',
    masterId: 'master-massage-1',
    title: {
      EN: 'Relax Massage Session',
      ES: 'Sesión de masaje relax',
      RU: 'Сеанс расслабляющего массажа',
      CZ: 'Relaxační masáž',
      DE: 'Entspannungsmassage',
      PL: 'Sesja masażu relaksacyjnego',
    },
    subtitle: {
      EN: 'Free aromatherapy upgrade',
      ES: 'Mejora gratis a aromaterapia',
      RU: 'Бесплатное улучшение до ароматерапии',
      CZ: 'Aromaterapie zdarma',
      DE: 'Kostenloses Aromatherapie-Upgrade',
      PL: 'Darmowe ulepszenie do aromaterapii',
    },
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
    description: {
      EN: 'A calming massage session designed to help you relax, release tension and reset. Includes a complimentary aromatherapy upgrade.',
      ES: 'Una sesión de masaje relajante diseñada para ayudarte a desconectar, liberar tensión y reiniciar. Incluye una mejora gratuita a aromaterapia.',
      RU: 'Расслабляющий массаж, который помогает снять напряжение, расслабиться и восстановиться. Включает бесплатное улучшение до ароматерапии.',
      CZ: 'Uklidňující masáž navržená tak, aby vám pomohla relaxovat, uvolnit napětí a načerpat novou energii. Zahrnuje aromaterapii zdarma.',
      DE: 'Eine beruhigende Massage, die Ihnen hilft, zu entspannen, Spannungen zu lösen und neue Energie zu tanken. Inklusive kostenlosem Aromatherapie-Upgrade.',
      PL: 'Relaksujący masaż zaprojektowany, aby pomóc Ci się wyciszyć, rozluźnić napięcie i odzyskać równowagę. Zawiera darmowe ulepszenie do aromaterapii.',
    },
    included: {
      EN: [
        '60-minute massage',
        'Aromatherapy upgrade',
        'Relaxing treatment room',
        'Aftercare tips',
      ],
      ES: [
        'Masaje de 60 minutos',
        'Mejora a aromaterapia',
        'Sala relajante de tratamiento',
        'Consejos posteriores',
      ],
      RU: [
        'Массаж 60 минут',
        'Ароматерапия',
        'Спокойная атмосфера кабинета',
        'Советы после процедуры',
      ],
      CZ: [
        '60minutová masáž',
        'Aromaterapie',
        'Relaxační místnost',
        'Doporučení po proceduře',
      ],
      DE: [
        '60-minütige Massage',
        'Aromatherapie-Upgrade',
        'Entspannender Behandlungsraum',
        'Pflegehinweise danach',
      ],
      PL: [
        '60-minutowy masaż',
        'Ulepszenie do aromaterapii',
        'Relaksujący gabinet',
        'Wskazówki po zabiegu',
      ],
    },
    oldPrice: '£70',
    newPrice: '£60',
    validUntil: {
      EN: 'This week',
      ES: 'Esta semana',
      RU: 'На этой неделе',
      CZ: 'Tento týden',
      DE: 'Diese Woche',
      PL: 'W tym tygodniu',
    },
    area: {
      EN: 'Covent Garden, London',
      ES: 'Covent Garden, Londres',
      RU: 'Ковент-Гарден, Лондон',
      CZ: 'Covent Garden, Londýn',
      DE: 'Covent Garden, London',
      PL: 'Covent Garden, Londyn',
    },
    address: {
      EN: '12 Floral Street, London',
      ES: '12 Floral Street, Londres',
      RU: '12 Floral Street, Лондон',
      CZ: '12 Floral Street, Londýn',
      DE: '12 Floral Street, London',
      PL: '12 Floral Street, Londyn',
    },
    distance: {
      EN: '1.5 miles away',
      ES: 'a 1.5 millas',
      RU: '1.5 мили от вас',
      CZ: '1,5 míle od vás',
      DE: '1,5 Meilen entfernt',
      PL: '1.5 mili od Ciebie',
    },
  },
];

function emitChange() {
  listeners.forEach((listener) => listener());
}

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function getCurrentLanguage(): AppLanguage {
  if (!canUseStorage()) return 'EN';

  try {
    return getSavedLanguage();
  } catch {
    return 'EN';
  }
}

function pickLocalizedText(value: LocalizedText | undefined, language: AppLanguage): string {
  if (!value) return '';

  if (typeof value === 'string') {
    return value;
  }

  return value[language] || value.EN || '';
}

function pickLocalizedList(value: LocalizedList | undefined, language: AppLanguage): string[] {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value;
  }

  return value[language] || value.EN || [];
}

function normalizePromotionRecord(item: PromotionRecord): PromotionRecord {
  return {
    ...item,
    subtitle: item.subtitle || '',
    description: item.description || '',
    included: item.included || [],
    oldPrice: item.oldPrice || '',
    newPrice: item.newPrice || '',
    validUntil: item.validUntil || '',
    area: item.area || '',
    address: item.address || '',
    distance: item.distance || '',
  };
}

function localizePromotion(item: PromotionRecord, language: AppLanguage): PromotionItem {
  return {
    id: item.id,
    masterId: item.masterId,
    title: pickLocalizedText(item.title, language),
    subtitle: pickLocalizedText(item.subtitle, language),
    image: item.image,
    categoryId: item.categoryId,
    centerLat: item.centerLat,
    centerLng: item.centerLng,
    radiusKm: item.radiusKm,
    startAt: item.startAt,
    endAt: item.endAt,
    createdAt: item.createdAt,
    status: item.status,
    views: item.views,
    description: pickLocalizedText(item.description, language),
    included: pickLocalizedList(item.included, language),
    oldPrice: item.oldPrice || '',
    newPrice: item.newPrice || '',
    validUntil: pickLocalizedText(item.validUntil, language),
    area: pickLocalizedText(item.area, language),
    address: pickLocalizedText(item.address, language),
    distance: pickLocalizedText(item.distance, language),
  };
}

function readStore(): PromotionRecord[] {
  if (!canUseStorage()) {
    return defaultPromotions.map(normalizePromotionRecord);
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultPromotions));
    return defaultPromotions.map(normalizePromotionRecord);
  }

  try {
    const parsed = JSON.parse(raw) as PromotionRecord[];

    if (!Array.isArray(parsed) || parsed.length === 0) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultPromotions));
      return defaultPromotions.map(normalizePromotionRecord);
    }

    return parsed.map(normalizePromotionRecord);
  } catch {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultPromotions));
    return defaultPromotions.map(normalizePromotionRecord);
  }
}

function writeStore(items: PromotionRecord[]) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  emitChange();
}

function toTime(value: string) {
  return new Date(value).getTime();
}

function isPromotionLive(item: PromotionRecord, now = Date.now()) {
  if (item.status !== 'active') return false;

  const start = toTime(item.startAt);
  const end = toTime(item.endAt);

  if (Number.isNaN(start) || Number.isNaN(end)) return false;

  return now >= start && now <= end;
}

function degreesToRadians(value: number) {
  return (value * Math.PI) / 180;
}

function getDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number) {
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

function isInsidePromotionRadius(item: PromotionRecord, userLat: number, userLng: number) {
  const distance = getDistanceKm(userLat, userLng, item.centerLat, item.centerLng);
  return distance <= item.radiusKm;
}

export function getPromotions(language: AppLanguage = getCurrentLanguage()) {
  return readStore()
    .sort((a, b) => toTime(b.createdAt) - toTime(a.createdAt))
    .map((item) => localizePromotion(item, language));
}

export function getPromotionById(id: string, language: AppLanguage = getCurrentLanguage()) {
  const item = readStore().find((promotion) => promotion.id === id);
  return item ? localizePromotion(item, language) : null;
}

export function getActivePromotions(language: AppLanguage = getCurrentLanguage()) {
  const now = Date.now();

  return readStore()
    .filter((item) => isPromotionLive(item, now))
    .sort((a, b) => toTime(b.createdAt) - toTime(a.createdAt))
    .map((item) => localizePromotion(item, language));
}

export function getVisiblePromotionsForLocation(
  userLat: number,
  userLng: number,
  categoryId?: string,
  language: AppLanguage = getCurrentLanguage()
) {
  const normalizedCategory = String(categoryId || '').toLowerCase().trim();
  const activeRaw = readStore()
    .filter((item) => isPromotionLive(item, Date.now()))
    .sort((a, b) => toTime(b.createdAt) - toTime(a.createdAt));

  const categoryItems = normalizedCategory
    ? activeRaw.filter((item) => item.categoryId.toLowerCase() === normalizedCategory)
    : activeRaw;

  const inRadius = categoryItems.filter((item) =>
    isInsidePromotionRadius(item, userLat, userLng)
  );

  if (inRadius.length > 0) {
    return inRadius.map((item) => localizePromotion(item, language));
  }

  if (categoryItems.length > 0) {
    return categoryItems.map((item) => localizePromotion(item, language));
  }

  return activeRaw.map((item) => localizePromotion(item, language));
}

export function addPromotion(item: PromotionRecord) {
  const current = readStore();
  writeStore([...current, normalizePromotionRecord(item)]);
}

export function updatePromotion(id: string, updates: Partial<PromotionRecord>) {
  const current = readStore();

  const next = current.map((item) =>
    item.id === id ? normalizePromotionRecord({ ...item, ...updates }) : item
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
  writeStore(defaultPromotions.map(normalizePromotionRecord));
}
