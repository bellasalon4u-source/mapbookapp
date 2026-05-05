'use client';

import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { getAllMasters } from '../services/masters';
import { categories } from '../services/categories';
import { t, getSavedLanguage, type AppLanguage } from '../services/i18n';
import {
  getListings,
  subscribeToListingsStore,
  type ListingItem,
} from '../services/listingsStore';
import {
  getLikedMasterIds,
  subscribeToLikedMasters,
  toggleLikedMaster,
} from '../services/likedMastersStore';
import {
  getVisiblePromotionsForLocation,
  incrementPromotionViews,
  subscribeToPromotionsStore,
  type PromotionItem,
} from '../services/promotionsStore';
import {
  getEffectiveSearchLocation,
  subscribeToAppRegionSettings,
} from '../services/appRegionStore';
import { refreshLiveCurrencyRates } from '../services/currencyDisplay';
import {
  getWalletState,
  setWalletState,
  type WalletTransaction,
} from '../services/walletStore';
import BottomNav from '../components/common/BottomNav';
import TopCategoriesBar from '../components/TopCategoriesBar';

const RealMap = dynamic(() => import('../components/RealMap'), {
  ssr: false,
});

const popularSearches = [
  'Dog grooming',
  'Carpet cleaning',
  'Phone repair',
  'Hair extensions',
  'Massage',
  'Nails',
  'Manicure',
  'Cleaning',
  'Private chef',
  'Moving help',
];

const searchAliases = [
  {
    label: 'Pets',
    categoryId: 'pets',
    subcategory: '',
    keywords: [
      'pets',
      'pet',
      'dog',
      'dogs',
      'cat',
      'cats',
      'puppy',
      'puppies',
      'animal',
      'animals',
      'собака',
      'собаки',
      'собак',
      'пес',
      'пёс',
      'питомец',
      'питомцы',
      'животные',
      'тварини',
      'кіт',
      'коти',
      'perro',
      'perros',
      'gato',
      'gatos',
      'mascota',
      'mascotas',
      'chien',
      'chiens',
      'chat',
      'chats',
      'hund',
      'hunde',
      'katze',
      'katzen',
      'pies',
      'psy',
      'kot',
      'koty',
      'zvíře',
      'zvířata',
      'pes',
      'kočka',
    ],
  },
  {
    label: 'Dog grooming',
    categoryId: 'pets',
    subcategory: 'Grooming',
    keywords: [
      'grooming',
      'dog grooming',
      'pet grooming',
      'groomer',
      'dog groomer',
      'pet haircut',
      'dog haircut',
      'dog washing',
      'dog wash',
      'грумер',
      'груминг',
      'грумінг',
      'стрижка собак',
      'стрижка собаки',
      'мойка собак',
      'мытье собак',
      'мытьё собак',
      'уход за собакой',
      'уход за животными',
      'дог грумер',
      'собачий грумер',
      'перукар для собак',
      'grooming perro',
      'peluquería canina',
      'peluqueria canina',
      'corte de pelo perro',
      'lavado perro',
      'toilettage chien',
      'hundefriseur',
      'hundepflege',
      'psi fryzjer',
      'groomer psów',
      'stříhání psů',
    ],
  },
  {
    label: 'Dog walking',
    categoryId: 'pets',
    subcategory: 'Dog Walking',
    keywords: [
      'dog walking',
      'dog walker',
      'walk dog',
      'walk my dog',
      'выгул собак',
      'выгул собаки',
      'погулять с собакой',
      'гулять собаку',
      'вигул собак',
      'paseador de perros',
      'paseo de perros',
      'promeneur chien',
      'hund ausführen',
      'wyprowadzanie psów',
      'venčení psů',
    ],
  },
  {
    label: 'Dog hotel',
    categoryId: 'pets',
    subcategory: 'Pet Sitting',
    keywords: [
      'dog hotel',
      'hotel for dogs',
      'pet hotel',
      'dog boarding',
      'pet sitting',
      'pet sitter',
      'dog sitter',
      'cat sitter',
      'передержка собак',
      'передержка животных',
      'отель для собак',
      'няня для собаки',
      'догситтер',
      'петситтер',
      'дог ситтер',
      'догсіттер',
      'готель для собак',
      'hotel para perros',
      'cuidador de perros',
      'canguro perros',
      'garde chien',
      'hundepension',
      'opieka nad psem',
      'hlídání psů',
    ],
  },
  {
    label: 'Carpet cleaning',
    categoryId: 'home',
    subcategory: 'Deep Cleaning',
    keywords: [
      'carpet cleaning',
      'clean carpet',
      'wash carpet',
      'rug cleaning',
      'deep carpet cleaning',
      'stain removal carpet',
      'мойка ковров',
      'чистка ковров',
      'чистка ковра',
      'ковры',
      'ковер',
      'ковёр',
      'ковров',
      'химчистка ковров',
      'почистить ковер',
      'почистить ковёр',
      'помыть ковер',
      'помыть ковёр',
      'прання килимів',
      'чистка килимів',
      'килим',
      'килими',
      'limpieza de alfombras',
      'limpieza alfombras',
      'limpieza',
      'limpiesa',
      'limpeza',
      'lopeza',
      'alfombra',
      'alfombras',
      'lavado alfombra',
      'lavado de alfombras',
      'nettoyage tapis',
      'tapis',
      'teppichreinigung',
      'teppich',
      'pranie dywanów',
      'dywan',
      'dywany',
      'čištění koberců',
      'koberec',
    ],
  },
  {
    label: 'Cleaning',
    categoryId: 'home',
    subcategory: 'Cleaning',
    keywords: [
      'cleaning',
      'cleaner',
      'home cleaning',
      'house cleaning',
      'deep cleaning',
      'maid',
      'уборка',
      'уборщица',
      'убрать дом',
      'уборка дома',
      'генеральная уборка',
      'клининг',
      'прибирання',
      'прибиральниця',
      'limpieza',
      'limpieza casa',
      'limpieza hogar',
      'limpiesa',
      'limpeza',
      'ménage',
      'nettoyage',
      'reinigung',
      'putzfrau',
      'sprzątanie',
      'úklid',
    ],
  },
  {
    label: 'Handyman',
    categoryId: 'home',
    subcategory: 'Handyman',
    keywords: [
      'handyman',
      'home help',
      'furniture assembly',
      'mount shelf',
      'fix home',
      'мастер на дом',
      'муж на час',
      'повесить полку',
      'собрать мебель',
      'домашний мастер',
      'майстер додому',
      'montar muebles',
      'manitas',
      'bricolage',
      'heimwerker',
      'złota rączka',
      'hodinový manžel',
    ],
  },
  {
    label: 'Phone repair',
    categoryId: 'tech',
    subcategory: 'Phone Repair',
    keywords: [
      'phone repair',
      'fix phone',
      'screen repair',
      'iphone repair',
      'samsung repair',
      'mobile repair',
      'ремонт телефона',
      'ремонт телефонов',
      'починить телефон',
      'разбит экран',
      'замена экрана',
      'айфон ремонт',
      'ремонт айфона',
      'ремонт телефону',
      'reparación teléfono',
      'reparacion telefono',
      'arreglar móvil',
      'arreglar movil',
      'réparation téléphone',
      'handy reparatur',
      'naprawa telefonu',
      'oprava telefonu',
    ],
  },
  {
    label: 'Computer repair',
    categoryId: 'tech',
    subcategory: 'Computer Repair',
    keywords: [
      'computer repair',
      'laptop repair',
      'pc repair',
      'macbook repair',
      'fix laptop',
      'ремонт компьютера',
      'ремонт ноутбука',
      'починить ноутбук',
      'компьютерный мастер',
      'ремонт компʼютера',
      'reparación ordenador',
      'reparacion ordenador',
      'réparation ordinateur',
      'computer reparatur',
      'naprawa komputera',
      'oprava počítače',
    ],
  },
  {
    label: 'Hair extensions',
    categoryId: 'beauty',
    subcategory: 'Hair',
    keywords: [
      'hair extensions',
      'hairextensions',
      'hair extension',
      'hair',
      'hairstyle',
      'hair stylist',
      'наращивание волос',
      'волосы',
      'прическа',
      'парикмахер',
      'укладка',
      'нарощування волосся',
      'cabello',
      'extensiones de cabello',
      'peluquería',
      'peluqueria',
      'cheveux',
      'coiffure',
      'haarverlängerung',
      'friseur',
      'przedłużanie włosów',
      'fryzjer',
      'kadeřník',
      'prodloužení vlasů',
    ],
  },
  {
    label: 'Nails',
    categoryId: 'beauty',
    subcategory: 'Nails',
    keywords: [
      'nails',
      'nail',
      'manicure',
      'pedicure',
      'gel nails',
      'ногти',
      'ноготь',
      'маникюр',
      'педикюр',
      'гель лак',
      'шеллак',
      'манікюр',
      'педикюр',
      'uñas',
      'unas',
      'manicura',
      'pedicura',
      'ongles',
      'manucure',
      'nägel',
      'maniküre',
      'paznokcie',
      'manicure',
      'nehty',
      'manikúra',
    ],
  },
  {
    label: 'Brows & lashes',
    categoryId: 'beauty',
    subcategory: 'Brows & Lashes',
    keywords: [
      'brows',
      'eyebrows',
      'lashes',
      'eyelashes',
      'brow lamination',
      'lash extensions',
      'брови',
      'ресницы',
      'ламинирование бровей',
      'наращивание ресниц',
      'бровист',
      'вії',
      'cejas',
      'pestañas',
      'cil',
      'cils',
      'wimpern',
      'brwi',
      'rzęsy',
      'obočí',
      'řasy',
    ],
  },
  {
    label: 'Makeup',
    categoryId: 'beauty',
    subcategory: 'Makeup',
    keywords: [
      'makeup',
      'make up',
      'mua',
      'макияж',
      'визажист',
      'мейкап',
      'макіяж',
      'maquillaje',
      'maquillador',
      'maquillage',
      'schminken',
      'make-up',
      'makijaż',
      'líčení',
    ],
  },
  {
    label: 'Massage',
    categoryId: 'wellness',
    subcategory: 'Massage',
    keywords: [
      'massage',
      'body massage',
      'deep tissue',
      'relax massage',
      'массаж',
      'масаж',
      'массажист',
      'масажист',
      'masaje',
      'masajista',
      'massage relaxant',
      'massagetherapie',
      'masaż',
      'masér',
      'masáž',
    ],
  },
  {
    label: 'Spa',
    categoryId: 'wellness',
    subcategory: 'Spa',
    keywords: [
      'spa',
      'sauna',
      'hammam',
      'wellness',
      'relaxation',
      'спа',
      'сауна',
      'хамам',
      'баня',
      'спа салон',
      'balneario',
      'sauna',
      'bienestar',
      'wellness',
    ],
  },
  {
    label: 'Barber',
    categoryId: 'barber',
    subcategory: 'Haircut',
    keywords: [
      'barber',
      'haircut men',
      'mens haircut',
      'fade',
      'beard',
      'beard trim',
      'барбер',
      'мужская стрижка',
      'стрижка мужская',
      'борода',
      'фейд',
      'барбершоп',
      'чоловіча стрижка',
      'barbero',
      'corte hombre',
      'barbier',
      'coiffeur homme',
      'friseur herren',
      'fryzjer męski',
      'holič',
    ],
  },
  {
    label: 'Private chef',
    categoryId: 'food',
    subcategory: 'Chef at Home',
    keywords: [
      'private chef',
      'chef at home',
      'home chef',
      'personal chef',
      'chef',
      'повар на дом',
      'шеф повар',
      'шеф-повар',
      'личный повар',
      'кухар додому',
      'chef a domicilio',
      'chef privado',
      'cocinero privado',
      'chef à domicile',
      'privatkoch',
      'kucharz prywatny',
      'soukromý kuchař',
    ],
  },
  {
    label: 'Restaurant table',
    categoryId: 'food',
    subcategory: 'Restaurant Table Booking',
    keywords: [
      'restaurant',
      'restaurant table',
      'table booking',
      'book table',
      'bar table',
      'reservation',
      'ресторан',
      'забронировать столик',
      'бронь столика',
      'столик в ресторане',
      'бар',
      'ресторан бронь',
      'резервація столика',
      'reservar mesa',
      'mesa restaurante',
      'reserva restaurante',
      'réserver table',
      'restaurant reservierung',
      'rezerwacja stolika',
      'rezervace stolu',
    ],
  },
  {
    label: 'Moving help',
    categoryId: 'moving',
    subcategory: 'Small Moves',
    keywords: [
      'moving',
      'move house',
      'small moves',
      'van help',
      'delivery',
      'courier',
      'переезд',
      'перевозка',
      'грузчик',
      'доставка',
      'курьер',
      'ван',
      'переїзд',
      'вантажник',
      'mudanza',
      'transporte',
      'furgoneta',
      'livraison',
      'déménagement',
      'umzug',
      'transport',
      'przeprowadzka',
      'dostawa',
      'stěhování',
    ],
  },
  {
    label: 'Car wash',
    categoryId: 'auto',
    subcategory: 'Car Wash',
    keywords: [
      'car wash',
      'wash car',
      'detailing',
      'auto detailing',
      'мойка авто',
      'мойка машины',
      'автомойка',
      'детейлинг',
      'мийка авто',
      'lavado coche',
      'lavado auto',
      'lavage voiture',
      'autowäsche',
      'myjnia',
      'mycie auta',
      'mytí auta',
    ],
  },
  {
    label: 'Auto diagnostics',
    categoryId: 'auto',
    subcategory: 'Diagnostics',
    keywords: [
      'car diagnostics',
      'auto diagnostics',
      'battery help',
      'tyre help',
      'car repair',
      'диагностика авто',
      'ремонт авто',
      'аккумулятор авто',
      'шины',
      'колесо',
      'діагностика авто',
      'diagnóstico coche',
      'diagnostic voiture',
      'auto diagnose',
      'diagnostyka auta',
      'diagnostika auta',
    ],
  },
  {
    label: 'Tattoo',
    categoryId: 'beauty',
    subcategory: 'Tattoo',
    keywords: [
      'tattoo',
      'tattoo artist',
      'тату',
      'татуировка',
      'тату мастер',
      'татуаж',
      'tatuaje',
      'tatoueur',
      'tätowierung',
      'tatuaż',
      'tetování',
    ],
  },
  {
    label: 'Piercing',
    categoryId: 'beauty',
    subcategory: 'Piercing',
    keywords: [
      'piercing',
      'пирсинг',
      'пірсинг',
      'perforación',
      'perforacion',
      'piercing oreja',
      'piercing nez',
      'kolczykowanie',
    ],
  },
  {
    label: 'Tattoo removal',
    categoryId: 'beauty',
    subcategory: 'Tattoo Removal',
    keywords: [
      'tattoo removal',
      'remove tattoo',
      'laser tattoo removal',
      'удаление тату',
      'удалить тату',
      'лазерное удаление тату',
      'видалення тату',
      'eliminar tatuaje',
      'borrar tatuaje',
      'détatouage',
      'tattoo entfernung',
      'usuwanie tatuażu',
      'odstranění tetování',
    ],
  },
  {
    label: 'Fitness trainer',
    categoryId: 'fitness',
    subcategory: 'Personal Training',
    keywords: [
      'fitness',
      'personal trainer',
      'trainer',
      'gym trainer',
      'workout',
      'тренер',
      'фитнес',
      'фітнес',
      'персональный тренер',
      'entrenador personal',
      'coach sportif',
      'personal trainer',
      'trener personalny',
      'osobní trenér',
    ],
  },
  {
    label: 'Yoga',
    categoryId: 'fitness',
    subcategory: 'Yoga',
    keywords: [
      'yoga',
      'pilates',
      'stretching',
      'йога',
      'пилатес',
      'растяжка',
      'пілатес',
      'estiramientos',
      'yoga',
      'joga',
      'pilates',
    ],
  },
  {
    label: 'Tutor',
    categoryId: 'education',
    subcategory: 'Tutoring',
    keywords: [
      'tutor',
      'tutoring',
      'teacher',
      'lessons',
      'репетитор',
      'учитель',
      'уроки',
      'обучение',
      'занятия',
      'репетитор',
      'clases',
      'profesor particular',
      'cours particulier',
      'nachhilfe',
      'korepetycje',
      'doučování',
    ],
  },
  {
    label: 'Languages',
    categoryId: 'education',
    subcategory: 'Languages',
    keywords: [
      'english teacher',
      'language lessons',
      'learn english',
      'английский',
      'уроки английского',
      'чешский',
      'испанский',
      'мови',
      'англійська',
      'clases inglés',
      'aprender inglés',
      'cours anglais',
      'englisch lernen',
      'lekcje angielskiego',
      'angličtina',
    ],
  },
  {
    label: 'Photography',
    categoryId: 'events',
    subcategory: 'Photography',
    keywords: [
      'photographer',
      'photo shoot',
      'photography',
      'event photo',
      'фотограф',
      'фотосессия',
      'свадебный фотограф',
      'фотографія',
      'fotógrafo',
      'fotografo',
      'photographe',
      'fotograf',
      'fotografování',
    ],
  },
  {
    label: 'Event DJ',
    categoryId: 'events',
    subcategory: 'DJ & Music',
    keywords: [
      'dj',
      'music event',
      'party music',
      'event music',
      'диджей',
      'ди джей',
      'музыка на праздник',
      'діджей',
      'música fiesta',
      'dj mariage',
      'dj event',
      'dj wesele',
    ],
  },
  {
    label: 'Graphic design',
    categoryId: 'creative',
    subcategory: 'Graphic Design',
    keywords: [
      'graphic design',
      'logo design',
      'designer',
      'branding',
      'дизайн',
      'логотип',
      'графический дизайн',
      'брендинг',
      'дизайнер',
      'diseño gráfico',
      'diseño logo',
      'graphiste',
      'grafikdesign',
      'projekt logo',
      'grafický design',
    ],
  },
  {
    label: 'Video editing',
    categoryId: 'creative',
    subcategory: 'Video Editing',
    keywords: [
      'video editing',
      'edit video',
      'montage',
      'content creation',
      'монтаж видео',
      'видеомонтаж',
      'создание контента',
      'монтаж відео',
      'edición vídeo',
      'montage vidéo',
      'videoschnitt',
      'montaż wideo',
      'střih videa',
    ],
  },
  {
    label: 'Tailoring',
    categoryId: 'fashion',
    subcategory: 'Tailoring',
    keywords: [
      'tailoring',
      'alterations',
      'sewing',
      'dress repair',
      'clothing repair',
      'ателье',
      'швея',
      'ремонт одежды',
      'подшить',
      'пошив',
      'кравець',
      'costurera',
      'arreglos ropa',
      'couture',
      'schneiderei',
      'krawiec',
      'krejčí',
    ],
  },
];

const tickerMessages: Record<AppLanguage, string[]> = {
  EN: ['Hot offers near you', 'New masters added today', 'Verified specialists', 'Instant booking'],
  ES: ['Ofertas cerca de ti', 'Nuevos especialistas hoy', 'Especialistas verificados', 'Reserva instantánea'],
  RU: ['Горячие предложения рядом', 'Новые мастера сегодня', 'Проверенные специалисты', 'Мгновенное бронирование'],
  UA: ['Гарячі пропозиції поруч', 'Нові майстри сьогодні', 'Перевірені спеціалісти', 'Миттєве бронювання'],
  CZ: ['Akční nabídky poblíž', 'Noví specialisté dnes', 'Ověření specialisté', 'Okamžitá rezervace'],
  DE: ['Angebote in deiner Nähe', 'Neue Profis heute', 'Verifizierte Spezialisten', 'Sofort buchen'],
  IT: ['Offerte vicino a te', 'Nuovi specialisti oggi', 'Specialisti verificati', 'Prenotazione immediata'],
  FR: ['Offres près de vous', 'Nouveaux pros aujourd’hui', 'Spécialistes vérifiés', 'Réservation instantanée'],
  AR: ['عروض قريبة منك', 'متخصصون جدد اليوم', 'متخصصون موثّقون', 'حجز فوري'],
  PL: ['Oferty blisko Ciebie', 'Nowi specjaliści dziś', 'Zweryfikowani specjaliści', 'Natychmiastowa rezerwacja'],
};

type SearchResult =
  | {
      type: 'smart';
      id: string;
      label: string;
      categoryId: string;
      subcategory: string;
    }
  | {
      type: 'category';
      id: string;
      label: string;
      categoryId: string;
    }
  | {
      type: 'subcategory';
      id: string;
      label: string;
      categoryId: string;
    }
  | {
      type: 'master';
      id: string;
      label: string;
      categoryId: string;
      master: any;
    };

type SmartSearchResult = Extract<SearchResult, { type: 'smart' }>;
type CategorySearchResult = Extract<SearchResult, { type: 'category' }>;
type SubcategorySearchResult = Extract<SearchResult, { type: 'subcategory' }>;
type MasterSearchResult = Extract<SearchResult, { type: 'master' }>;
type DealFilterMode = 'none' | 'category' | 'all';

type RadiusSearchConfig = {
  enabled: boolean;
  mode: 'near-me' | 'custom';
  label: string;
  center: [number, number];
  radiusKm: number;
};

function mapCategoryToId(category: string) {
  const normalized = (category || '').toLowerCase().trim();

  const found = categories.find(
    (item) =>
      item.id.toLowerCase() === normalized ||
      item.label.toLowerCase() === normalized ||
      (item.shortLabel || '').toLowerCase() === normalized
  );

  return found?.id || normalized || 'beauty';
}

function distanceKmBetweenPoints(pointA: [number, number], pointB: [number, number]) {
  const toRad = (value: number) => (value * Math.PI) / 180;

  const lat1 = Number(pointA[0]);
  const lng1 = Number(pointA[1]);
  const lat2 = Number(pointB[0]);
  const lng2 = Number(pointB[1]);

  if (
    !Number.isFinite(lat1) ||
    !Number.isFinite(lng1) ||
    !Number.isFinite(lat2) ||
    !Number.isFinite(lng2)
  ) {
    return Number.POSITIVE_INFINITY;
  }

  const earthRadiusKm = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusKm * c;
}

function isMasterInsideRadius(master: any, radiusSearch: RadiusSearchConfig | null) {
  if (!radiusSearch?.enabled) return true;

  const lat = Number(master?.lat);
  const lng = Number(master?.lng);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return false;

  const distanceKm = distanceKmBetweenPoints(radiusSearch.center, [lat, lng]);

  return distanceKm <= Math.max(1, Number(radiusSearch.radiusKm) || 1);
}

function listingToMaster(listing: ListingItem, index: number) {
  const fallbackCoords: [number, number][] = [
    [51.5074, -0.1278],
    [51.533, -0.164],
    [51.498, -0.183],
    [51.54, -0.045],
    [51.484, -0.02],
    [51.5202, -0.1028],
    [51.5159, -0.1426],
    [51.5098, -0.118],
  ];

  const coords = fallbackCoords[index % fallbackCoords.length];
  const categoryId = mapCategoryToId(listing.category);

  return {
    id: listing.id,
    name: listing.title,
    title: listing.title,
    category: categoryId,
    subcategory: listing.subcategory || '',
    city: listing.location || 'London',
    rating: 4.8,
    availableToday: listing.availableToday,
    availableNow: listing.availableToday,
    lat: coords[0],
    lng: coords[1],
    avatar:
      listing.photos?.[0] ||
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
    description: listing.description,
    price: listing.price,
    paymentMethods: listing.paymentMethods as ('cash' | 'card' | 'wallet')[],
    hours: listing.hours,
  };
}

function normalizeText(value: string) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ё/g, 'е')
    .replace(/ї/g, 'і')
    .replace(/[\u2019']/g, '')
    .replace(/[^a-zа-яіїєґ0-9\s-]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function getSearchTokens(value: string) {
  return normalizeText(value)
    .split(' ')
    .map((item) => item.trim())
    .filter((item) => item.length >= 2);
}

function levenshteinDistance(a: string, b: string) {
  const first = normalizeText(a);
  const second = normalizeText(b);

  if (first === second) return 0;
  if (!first) return second.length;
  if (!second) return first.length;

  const previous = Array.from({ length: second.length + 1 }, (_, index) => index);

  for (let i = 0; i < first.length; i += 1) {
    const current = [i + 1];

    for (let j = 0; j < second.length; j += 1) {
      const insert = current[j] + 1;
      const remove = previous[j + 1] + 1;
      const replace = previous[j] + (first[i] === second[j] ? 0 : 1);

      current.push(Math.min(insert, remove, replace));
    }

    previous.splice(0, previous.length, ...current);
  }

  return previous[second.length];
}

function fuzzyTokenScore(queryToken: string, targetToken: string) {
  if (!queryToken || !targetToken) return 0;
  if (queryToken === targetToken) return 58;
  if (targetToken.startsWith(queryToken) || queryToken.startsWith(targetToken)) return 46;
  if (targetToken.includes(queryToken) || queryToken.includes(targetToken)) return 38;

  const maxLength = Math.max(queryToken.length, targetToken.length);
  const distance = levenshteinDistance(queryToken, targetToken);

  if (maxLength >= 7 && distance <= 2) return 34;
  if (maxLength >= 4 && distance <= 1) return 28;

  return 0;
}

function scoreTextMatch(query: string, target: string) {
  const q = normalizeText(query);
  const tValue = normalizeText(target);

  if (!q || !tValue) return 0;
  if (tValue === q) return 140;
  if (tValue.startsWith(q)) return 112;
  if (tValue.includes(q)) return 92;
  if (q.includes(tValue) && tValue.length >= 4) return 82;

  const queryTokens = getSearchTokens(q);
  const targetTokens = getSearchTokens(tValue);

  if (queryTokens.length === 0 || targetTokens.length === 0) return 0;

  let score = 0;

  queryTokens.forEach((queryToken) => {
    const bestTokenScore = Math.max(
      ...targetTokens.map((targetToken) => fuzzyTokenScore(queryToken, targetToken))
    );

    score += bestTokenScore;
  });

  const allQueryTokensMatched = queryTokens.every((queryToken) =>
    targetTokens.some((targetToken) => fuzzyTokenScore(queryToken, targetToken) >= 28)
  );

  if (allQueryTokensMatched) {
    score += 35;
  }

  return score;
}

function saveRecentSearch(value: string) {
  if (typeof window === 'undefined') return;

  const trimmed = value.trim();
  if (!trimmed) return;

  const key = 'mapbook_recent_searches';
  const current = JSON.parse(window.localStorage.getItem(key) || '[]') as string[];
  const next = [
    trimmed,
    ...current.filter((item) => item.toLowerCase() !== trimmed.toLowerCase()),
  ].slice(0, 6);

  window.localStorage.setItem(key, JSON.stringify(next));
}

function readRecentSearches() {
  if (typeof window === 'undefined') return [] as string[];
  return JSON.parse(window.localStorage.getItem('mapbook_recent_searches') || '[]') as string[];
}

function languageFlag(language: AppLanguage) {
  if (language === 'ES') return '🇪🇸';
  if (language === 'RU') return '🇷🇺';
  if (language === 'CZ') return '🇨🇿';
  if (language === 'DE') return '🇩🇪';
  if (language === 'PL') return '🇵🇱';
  if (language === 'UA') return '🇺🇦';
  if (language === 'IT') return '🇮🇹';
  if (language === 'FR') return '🇫🇷';
  if (language === 'AR') return '🇦🇪';
  return '🇬🇧';
}

function getCurrencySymbolForLocation(label: string) {
  const lower = String(label || '').toLowerCase();

  if (lower.includes('prague') || lower.includes('czech')) return 'Kč';
  if (lower.includes('warsaw') || lower.includes('poland')) return 'zł';
  if (lower.includes('kyiv') || lower.includes('ukraine')) return '₴';
  if (lower.includes('madrid') || lower.includes('spain')) return '€';
  if (lower.includes('berlin') || lower.includes('germany')) return '€';

  return '£';
}

function getCategoryLabel(category?: string, language: AppLanguage = 'EN') {
  const normalized = String(category || '').toLowerCase();
  const found = categories.find((item) => item.id === normalized);

  if (!found) return 'Service';

  const map: Record<string, Partial<Record<AppLanguage, string>>> = {
    more: { EN: 'More', ES: 'Más', RU: 'Ещё', CZ: 'Více', DE: 'Mehr', PL: 'Więcej', UA: 'Ще' },
    beauty: { EN: 'Beauty', ES: 'Belleza', RU: 'Красота', CZ: 'Krása', DE: 'Beauty', PL: 'Uroda', UA: 'Краса' },
    barber: { EN: 'Barber', ES: 'Barbero', RU: 'Барбер', CZ: 'Barber', DE: 'Barber', PL: 'Barber', UA: 'Барбер' },
    wellness: { EN: 'Wellness', ES: 'Bienestar', RU: 'Велнес', CZ: 'Wellness', DE: 'Wellness', PL: 'Wellness', UA: 'Велнес' },
    food: { EN: 'Food', ES: 'Comida', RU: 'Еда', CZ: 'Jídlo', DE: 'Essen', PL: 'Jedzenie', UA: 'Їжа' },
    home: { EN: 'Home', ES: 'Hogar', RU: 'Дом', CZ: 'Domov', DE: 'Zuhause', PL: 'Dom', UA: 'Дім' },
    repairs: { EN: 'Repairs', ES: 'Reparaciones', RU: 'Ремонт', CZ: 'Opravy', DE: 'Reparaturen', PL: 'Naprawy', UA: 'Ремонт' },
    tech: { EN: 'Tech', ES: 'Tecnología', RU: 'Техника', CZ: 'Technika', DE: 'Technik', PL: 'Technika', UA: 'Техніка' },
    pets: { EN: 'Pets', ES: 'Mascotas', RU: 'Питомцы', CZ: 'Mazlíčci', DE: 'Haustiere', PL: 'Zwierzęta', UA: 'Тварини' },
    fashion: { EN: 'Fashion', ES: 'Moda', RU: 'Мода', CZ: 'Móda', DE: 'Mode', PL: 'Moda', UA: 'Мода' },
    auto: { EN: 'Auto', ES: 'Auto', RU: 'Авто', CZ: 'Auto', DE: 'Auto', PL: 'Auto', UA: 'Авто' },
    moving: { EN: 'Moving', ES: 'Mudanza', RU: 'Переезд', CZ: 'Stěhování', DE: 'Umzug', PL: 'Przeprowadzka', UA: 'Переїзд' },
    fitness: { EN: 'Fitness', ES: 'Fitness', RU: 'Фитнес', CZ: 'Fitness', DE: 'Fitness', PL: 'Fitness', UA: 'Фітнес' },
    education: { EN: 'Education', ES: 'Educación', RU: 'Обучение', CZ: 'Vzdělání', DE: 'Bildung', PL: 'Edukacja', UA: 'Освіта' },
    events: { EN: 'Events', ES: 'Eventos', RU: 'События', CZ: 'Události', DE: 'Events', PL: 'Wydarzenia', UA: 'Події' },
    activities: { EN: 'Activities', ES: 'Actividades', RU: 'Активности', CZ: 'Aktivity', DE: 'Aktivitäten', PL: 'Aktywności', UA: 'Активності' },
    creative: { EN: 'Creative', ES: 'Creativo', RU: 'Креатив', CZ: 'Kreativa', DE: 'Kreativ', PL: 'Kreatywne', UA: 'Креатив' },
  };

  return map[normalized]?.[language] || found.shortLabel || found.label;
}

function findPromotionMaster(promo: PromotionItem, masters: any[]) {
  const anyPromo = promo as any;
  const normalizedCategory = String(anyPromo.categoryId || '').toLowerCase().trim();
  const normalizedTitle = normalizeText(anyPromo.title);
  const normalizedSubtitle = normalizeText(anyPromo.subtitle || '');
  const words = `${normalizedTitle} ${normalizedSubtitle}`
    .split(' ')
    .filter((word) => word.length > 2);

  const exactByMasterId = masters.find(
    (master: any) =>
      String(master.id) === String(anyPromo.masterId) ||
      String(master.id) === String(anyPromo.listingId)
  );

  if (exactByMasterId) return exactByMasterId;

  const scoreMaster = (master: any) => {
    const haystack = normalizeText(
      [
        master.name || '',
        master.title || '',
        master.subcategory || '',
        master.description || '',
        master.category || '',
        master.city || '',
      ].join(' ')
    );

    let score = 0;

    if (normalizedTitle && haystack.includes(normalizedTitle)) score += 120;
    if (normalizedSubtitle && haystack.includes(normalizedSubtitle)) score += 80;

    words.forEach((word) => {
      if (haystack.includes(word)) score += 18;
    });

    if (
      normalizedCategory &&
      String(master.category || '').toLowerCase().trim() === normalizedCategory
    ) {
      score += 35;
    }

    return score;
  };

  const best = masters
    .map((master: any) => ({ master, score: scoreMaster(master) }))
    .sort((a, b) => b.score - a.score)[0];

  if (best && best.score > 0) return best.master;

  return null;
}

function isPromotionInCategory(promo: PromotionItem, categoryId: string) {
  return String((promo as any).categoryId || '')
    .toLowerCase()
    .trim() === String(categoryId || '').toLowerCase().trim();
}

function isUserRegistered() {
  if (typeof window === 'undefined') return false;

  const possibleKeys = [
    'olamepUserRegistered',
    'mapbookUserRegistered',
    'olamep_registered',
    'mapbook_registered',
    'olamep_auth_user',
    'mapbook_auth_user',
    'currentUser',
    'user',
  ];

  return possibleKeys.some((key) => {
    const value = window.localStorage.getItem(key);
    if (!value) return false;

    const normalized = value.toLowerCase().trim();

    return (
      normalized === 'yes' ||
      normalized === 'true' ||
      normalized === '1' ||
      normalized.includes('email') ||
      normalized.includes('phone') ||
      normalized.includes('name')
    );
  });
}

function savePendingGuestBooking(master: any) {
  if (typeof window === 'undefined') return;

  const registered = isUserRegistered();

  window.localStorage.setItem(
    'olamep_pending_guest_booking',
    JSON.stringify({
      masterId: master?.id || '',
      masterName: master?.name || master?.title || 'Professional',
      category: master?.category || 'beauty',
      subcategory: master?.subcategory || '',
      price: master?.price || master?.priceFrom || master?.startingPrice || '45',
      avatar: master?.avatar || master?.cover || '',
      createdAt: new Date().toISOString(),
      registered,
      internalWalletAllowed: registered,
    })
  );
}

function extractPromotionDiscountBadge(promo: PromotionItem) {
  const anyPromo = promo as any;

  const rawCandidates = [
    anyPromo.discountBadge,
    anyPromo.badgeText,
    anyPromo.discountText,
    anyPromo.discountLabel,
    anyPromo.discount,
  ];

  for (const candidate of rawCandidates) {
    if (typeof candidate === 'string' && candidate.trim()) {
      const value = candidate.trim();
      if (value.includes('%')) {
        return value.startsWith('-') ? value : `-${value.replace(/^-/, '')}`;
      }
      if (value.toUpperCase() === 'SALE') return 'SALE';
      return value;
    }
  }

  const numericCandidates = [
    anyPromo.discountPercent,
    anyPromo.discount_percentage,
    anyPromo.percentOff,
    anyPromo.salePercent,
  ];

  for (const candidate of numericCandidates) {
    if (typeof candidate === 'number' && Number.isFinite(candidate)) {
      return `-${candidate}%`;
    }

    if (typeof candidate === 'string' && candidate.trim()) {
      const parsed = Number(candidate.replace('%', '').trim());
      if (Number.isFinite(parsed)) {
        return `-${parsed}%`;
      }
    }
  }

  const subtitle = String(anyPromo.subtitle || '');
  const title = String(anyPromo.title || '');
  const combined = `${title} ${subtitle}`;
  const match = combined.match(/(\d{1,2})\s?%/);

  if (match) {
    return `-${match[1]}%`;
  }

  return 'SALE';
}

function getAppBackground(language: AppLanguage) {
  switch (language) {
    case 'EN':
      return 'linear-gradient(180deg, #eef4ff 0%, #ffffff 38%, #fff1f4 100%)';
    case 'RU':
      return 'linear-gradient(180deg, #f3f7ff 0%, #ffffff 48%, #fff2f2 100%)';
    case 'CZ':
      return 'linear-gradient(180deg, #eef4ff 0%, #ffffff 45%, #fff0f0 100%)';
    case 'DE':
      return 'linear-gradient(180deg, #fafafa 0%, #fffdf2 100%)';
    case 'PL':
      return 'linear-gradient(180deg, #ffffff 0%, #fff1f5 100%)';
    case 'UA':
      return 'linear-gradient(180deg, #eef6ff 0%, #fffbea 100%)';
    case 'ES':
      return 'linear-gradient(180deg, #fff8f0 0%, #fff3d9 100%)';
    case 'FR':
      return 'linear-gradient(180deg, #eef5ff 0%, #ffffff 45%, #fff1f1 100%)';
    case 'IT':
      return 'linear-gradient(180deg, #eefbf3 0%, #ffffff 45%, #fff2f2 100%)';
    case 'AR':
      return 'linear-gradient(180deg, #eef8f1 0%, #ffffff 55%, #fff4f4 100%)';
    default:
      return '#f6f4ef';
  }
}

function getTickerBackground(language: AppLanguage) {
  switch (language) {
    case 'EN':
      return 'linear-gradient(90deg, rgba(1,33,105,0.14) 0%, rgba(255,255,255,0.98) 42%, rgba(200,16,46,0.14) 100%)';
    case 'RU':
      return 'linear-gradient(90deg, rgba(255,255,255,1) 0%, rgba(0,57,166,0.12) 55%, rgba(213,43,30,0.14) 100%)';
    case 'CZ':
      return 'linear-gradient(90deg, rgba(17,69,126,0.14) 0%, rgba(255,255,255,0.98) 45%, rgba(215,20,26,0.14) 100%)';
    case 'DE':
      return 'linear-gradient(90deg, rgba(0,0,0,0.08) 0%, rgba(255,255,255,0.98) 50%, rgba(255,206,0,0.18) 100%)';
    case 'PL':
      return 'linear-gradient(90deg, rgba(255,255,255,1) 0%, rgba(220,20,60,0.14) 100%)';
    case 'ES':
      return 'linear-gradient(90deg, rgba(198,0,43,0.12) 0%, rgba(255,204,0,0.20) 52%, rgba(198,0,43,0.12) 100%)';
    case 'UA':
      return 'linear-gradient(90deg, rgba(0,87,183,0.14) 0%, rgba(255,213,0,0.20) 100%)';
    case 'FR':
      return 'linear-gradient(90deg, rgba(0,85,164,0.14) 0%, rgba(255,255,255,0.98) 50%, rgba(239,65,53,0.14) 100%)';
    case 'IT':
      return 'linear-gradient(90deg, rgba(0,146,70,0.14) 0%, rgba(255,255,255,0.98) 50%, rgba(206,43,55,0.14) 100%)';
    case 'AR':
      return 'linear-gradient(90deg, rgba(0,122,61,0.14) 0%, rgba(255,255,255,0.98) 55%, rgba(206,17,38,0.12) 100%)';
    default:
      return 'linear-gradient(90deg, #ffffff 0%, #fffdf9 100%)';
  }
}

function BrightTicker({ language }: { language: AppLanguage }) {
  const logo = '/ui/logo/logo.png';
  const messages = tickerMessages[language] || tickerMessages.EN;
  const flag = languageFlag(language);

  return (
    <div
      style={{
        height: 30,
        border: '2px solid #111111',
        background: getTickerBackground(language),
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        padding: '0 8px',
        borderRadius: 14,
        boxShadow: '0 2px 0 rgba(0,0,0,0.04)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, marginRight: 12 }}>
        <span style={{ fontSize: 14, lineHeight: 1 }}>{flag}</span>
        <img
          src={logo}
          alt="Olamep"
          style={{
            width: 58,
            height: 16,
            objectFit: 'contain',
            display: 'block',
          }}
        />
      </div>

      <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', flex: 1 }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            whiteSpace: 'nowrap',
            color: '#151515',
            fontSize: 11,
            fontWeight: 700,
            paddingLeft: '100%',
            animation: 'olamepTickerMove 18s linear infinite',
          }}
        >
          {[...messages, ...messages].map((item, index) => (
            <span key={`${item}-${index}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
              <span>{item}</span>
              <span style={{ color: '#d6b500', fontSize: 8 }}>●</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function QuickActionsPanel({
  open,
  onToggle,
  onQrReceive,
  onInvite,
  onFavourite,
  onAllFavourite,
  onHotOffers,
  onAllHotOffers,
  favouriteCount,
  allFavouriteCount,
  hotOffersCount,
  allHotOffersCount,
  favouriteActive,
  allFavouriteActive,
  hotOffersActive,
  allHotOffersActive,
}: {
  open: boolean;
  onToggle: () => void;
  onQrReceive: () => void;
  onInvite: () => void;
  onFavourite: () => void;
  onAllFavourite: () => void;
  onHotOffers: () => void;
  onAllHotOffers: () => void;
  favouriteCount: number;
  allFavouriteCount: number;
  hotOffersCount: number;
  allHotOffersCount: number;
  favouriteActive: boolean;
  allFavouriteActive: boolean;
  hotOffersActive: boolean;
  allHotOffersActive: boolean;
}) {
  const items = [
    {
      key: 'qr',
      label: 'QR payment',
      icon: '▦',
      color: '#2378ff',
      onClick: onQrReceive,
    },
    {
      key: 'invite',
      label: 'Invite friends',
      icon: '👥',
      color: '#2378ff',
      onClick: onInvite,
    },
    {
      key: 'favourite',
      label: 'Favourite',
      icon: '♥',
      color: '#ff3b58',
      count: favouriteCount,
      active: favouriteActive,
      onClick: onFavourite,
    },
    {
      key: 'allFavourite',
      label: 'All favourite',
      icon: '♥♥♥',
      color: '#ff3b58',
      count: allFavouriteCount,
      active: allFavouriteActive,
      onClick: onAllFavourite,
    },
    {
      key: 'hotOffers',
      label: 'Hot offers',
      icon: '%',
      color: '#171717',
      count: hotOffersCount,
      active: hotOffersActive,
      onClick: onHotOffers,
      yellow: true,
    },
    {
      key: 'allHotOffers',
      label: 'All hot offers',
      icon: '%',
      color: '#171717',
      count: allHotOffersCount,
      active: allHotOffersActive,
      onClick: onAllHotOffers,
      yellow: true,
    },
  ];

  return (
    <div
      style={{
        position: 'absolute',
        top: '50%',
        right: open ? 8 : -82,
        width: 78,
        zIndex: 3000,
        transform: 'translateY(-50%)',
        transition: 'right 0.28s ease',
        pointerEvents: 'auto',
      }}
    >
      <button
        type="button"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          onToggle();
        }}
        aria-label="Toggle quick actions"
        style={{
          position: 'absolute',
          left: -34,
          top: '50%',
          transform: 'translateY(-50%)',
          width: 36,
          height: 76,
          borderTopLeftRadius: 20,
          borderBottomLeftRadius: 20,
          border: '2px solid #111111',
          borderRight: 'none',
          background: '#55c75f',
          boxShadow: '0 8px 18px rgba(85,199,95,0.28)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          padding: 0,
          zIndex: 3002,
          pointerEvents: 'auto',
          touchAction: 'manipulation',
        }}
      >
        <span
          style={{
            fontSize: 20,
            fontWeight: 900,
            color: '#ffffff',
            lineHeight: 1,
          }}
        >
          {open ? '▸' : '◂'}
        </span>
      </button>

      <div
        style={{
          width: 78,
          borderRadius: 22,
          border: '2px solid #111111',
          background: 'rgba(255,253,248,0.98)',
          boxShadow: '0 14px 28px rgba(0,0,0,0.15)',
          padding: '8px 6px',
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
          boxSizing: 'border-box',
          backdropFilter: 'blur(10px)',
          zIndex: 3001,
          pointerEvents: 'auto',
        }}
      >
        {items.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              item.onClick();
            }}
            style={{
              minHeight: 50,
              borderRadius: 17,
              border: item.active ? '2px solid #111111' : '1.4px solid #ded7ce',
              background: item.active ? '#fff7d8' : '#ffffff',
              boxShadow: item.active ? '0 4px 0 rgba(0,0,0,0.08)' : '0 2px 8px rgba(0,0,0,0.04)',
              color: '#111111',
              cursor: 'pointer',
              padding: '6px 4px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              position: 'relative',
              pointerEvents: 'auto',
              touchAction: 'manipulation',
            }}
          >
            <span
              style={{
                minWidth: item.yellow ? 28 : 'auto',
                height: item.yellow ? 28 : 'auto',
                borderRadius: item.yellow ? '50%' : 0,
                background: item.yellow ? '#ffe44d' : 'transparent',
                color: item.color,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: item.key === 'allFavourite' ? 13 : 19,
                fontWeight: 900,
                lineHeight: 1,
              }}
            >
              {item.icon}
            </span>

            <span
              style={{
                maxWidth: 66,
                fontSize: 9.2,
                fontWeight: 900,
                lineHeight: 1.05,
                textAlign: 'center',
                color: '#171717',
              }}
            >
              {item.label}
            </span>

            {typeof item.count === 'number' ? (
              <span
                style={{
                  position: 'absolute',
                  top: -6,
                  right: -5,
                  minWidth: 20,
                  height: 20,
                  padding: '0 5px',
                  borderRadius: 999,
                  border: '1.5px solid #111111',
                  background: '#ffffff',
                  color: '#111111',
                  fontSize: 10,
                  fontWeight: 900,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxSizing: 'border-box',
                }}
              >
                {item.count > 99 ? '99+' : item.count}
              </span>
            ) : null}
          </button>
        ))}
      </div>
    </div>
  );
}

function PromoCard({
  promo,
  language,
  onOpen,
  onBook,
}: {
  promo: PromotionItem;
  language: AppLanguage;
  onOpen: () => void;
  onBook: () => void;
}) {
  const anyPromo = promo as any;
  const discountBadge = extractPromotionDiscountBadge(promo);
  const bookLabel =
    language === 'RU'
      ? 'Бронь'
      : language === 'UA'
      ? 'Бронь'
      : language === 'CZ'
      ? 'Rezervovat'
      : language === 'ES'
      ? 'Reservar'
      : 'Book';

  return (
    <button
      onClick={onOpen}
      style={{
        minWidth: 150,
        maxWidth: 150,
        border: '2px solid #111111',
        borderRadius: 16,
        background: '#ffffff',
        overflow: 'hidden',
        flexShrink: 0,
        padding: 0,
        textAlign: 'left',
        cursor: 'pointer',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      }}
    >
      <div style={{ position: 'relative' }}>
        <img
          src={anyPromo.image}
          alt={anyPromo.title}
          style={{
            width: '100%',
            height: 92,
            objectFit: 'cover',
            display: 'block',
          }}
        />

        <div
          style={{
            position: 'absolute',
            top: 6,
            left: 6,
            background: '#ffe44d',
            color: '#17130f',
            border: '1.5px solid #111111',
            borderRadius: 999,
            padding: '4px 8px',
            fontSize: 9,
            fontWeight: 900,
            boxShadow: '0 2px 6px rgba(0,0,0,0.07)',
          }}
        >
          {discountBadge}
        </div>
      </div>

      <div style={{ padding: '8px 10px 10px' }}>
        <div
          style={{
            fontSize: 12,
            fontWeight: 800,
            color: '#151515',
            lineHeight: 1.2,
            minHeight: 30,
          }}
        >
          {anyPromo.title}
        </div>

        <div
          style={{
            marginTop: 8,
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            gap: 8,
            alignItems: 'center',
          }}
        >
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onBook();
            }}
            style={{
              height: 30,
              borderRadius: 12,
              border: '1.5px solid #111111',
              background: '#1f6fff',
              color: '#ffffff',
              fontSize: 11,
              fontWeight: 900,
              cursor: 'pointer',
              boxShadow: '0 5px 12px rgba(31,111,255,0.24)',
            }}
          >
            {bookLabel}
          </button>

          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: '#151515',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <span style={{ fontSize: 12 }}>◉</span>
            <span>{anyPromo.views || 0}</span>
          </div>
        </div>
      </div>
    </button>
  );
}

function MasterMiniCard({
  master,
  language,
  liked,
  discountBadge,
  onClose,
  onLike,
  onOpen,
  onRoute,
  onBook,
}: {
  master: any;
  language: AppLanguage;
  liked: boolean;
  discountBadge?: string;
  onClose: () => void;
  onLike: () => void;
  onOpen: () => void;
  onRoute: () => void;
  onBook: () => void;
}) {
  const tr = t(language);
  const price = master.price || master.priceFrom || master.startingPrice || '45';
  const categoryLabel = getCategoryLabel(master.category, language);

  const [cardOffset, setCardOffset] = useState({ x: 0, y: 0 });
  const dragRef = useRef({
    active: false,
    startX: 0,
    startY: 0,
    originX: 0,
    originY: 0,
    moved: false,
  });

  const clamp = (value: number, min: number, max: number) => {
    return Math.max(min, Math.min(max, value));
  };

  const startDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;

    if (target.closest('button')) return;

    event.preventDefault();
    event.stopPropagation();

    dragRef.current = {
      active: true,
      startX: event.clientX,
      startY: event.clientY,
      originX: cardOffset.x,
      originY: cardOffset.y,
      moved: false,
    };

    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // Safe fallback.
    }
  };

  const moveDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.active) return;

    event.preventDefault();
    event.stopPropagation();

    const diffX = event.clientX - dragRef.current.startX;
    const diffY = event.clientY - dragRef.current.startY;

    if (Math.abs(diffX) > 4 || Math.abs(diffY) > 4) {
      dragRef.current.moved = true;
    }

    setCardOffset({
      x: clamp(dragRef.current.originX + diffX, -72, 72),
      y: clamp(dragRef.current.originY + diffY, -360, 26),
    });
  };

  const endDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.active) return;

    event.preventDefault();
    event.stopPropagation();

    dragRef.current.active = false;

    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      // Safe fallback.
    }
  };

  return (
    <div
      onPointerDown={startDrag}
      onPointerMove={moveDrag}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onClick={(event) => event.stopPropagation()}
      style={{
        position: 'absolute',
        left: 10,
        right: 10,
        bottom: 10,
        zIndex: 900,
        borderRadius: 22,
        border: '2px solid #111111',
        background: '#ffffff',
        boxShadow: dragRef.current.active
          ? '0 18px 34px rgba(0,0,0,0.24)'
          : '0 12px 28px rgba(0,0,0,0.18)',
        padding: '18px 10px 10px',
        transform: `translate3d(${cardOffset.x}px, ${cardOffset.y}px, 0)`,
        transition: dragRef.current.active ? 'none' : 'box-shadow 0.18s ease',
        touchAction: 'none',
        cursor: dragRef.current.active ? 'grabbing' : 'grab',
        userSelect: 'none',
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: 7,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 46,
          height: 5,
          borderRadius: 999,
          background: '#d6dbe2',
          border: '1px solid rgba(17,17,17,0.12)',
        }}
      />

      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onClose();
        }}
        style={{
          position: 'absolute',
          right: 9,
          top: 9,
          width: 26,
          height: 26,
          borderRadius: 999,
          border: '1.4px solid #111111',
          background: '#ffffff',
          color: '#111111',
          fontSize: 14,
          fontWeight: 900,
          cursor: 'pointer',
          zIndex: 2,
          touchAction: 'manipulation',
        }}
      >
        ×
      </button>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '68px 1fr',
          gap: 10,
          alignItems: 'center',
        }}
      >
        <div style={{ position: 'relative' }}>
          <img
            src={
              master.avatar ||
              master.cover ||
              'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80'
            }
            alt={master.name || master.title || 'Master'}
            style={{
              width: 68,
              height: 68,
              borderRadius: 18,
              objectFit: 'cover',
              display: 'block',
              border: '1.5px solid #111111',
              pointerEvents: 'none',
            }}
          />

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onLike();
            }}
            style={{
              position: 'absolute',
              right: -7,
              bottom: -7,
              width: 30,
              height: 30,
              borderRadius: 999,
              border: '1.5px solid #111111',
              background: '#ffffff',
              color: liked ? '#ff3b58' : '#222222',
              fontSize: 17,
              fontWeight: 900,
              cursor: 'pointer',
              boxShadow: '0 3px 8px rgba(0,0,0,0.12)',
              touchAction: 'manipulation',
            }}
          >
            {liked ? '♥' : '♡'}
          </button>
        </div>

        <div style={{ minWidth: 0, paddingRight: 30 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              marginBottom: 5,
              flexWrap: 'wrap',
            }}
          >
            <span
              style={{
                borderRadius: 999,
                background: master.availableNow ? '#dff2e3' : '#f4f1ea',
                color: master.availableNow ? '#15803d' : '#6f675f',
                border: '1.2px solid #111111',
                padding: '4px 8px',
                fontSize: 9,
                fontWeight: 900,
                whiteSpace: 'nowrap',
              }}
            >
              {master.availableNow ? tr.availableNow : tr.unavailableToday}
            </span>

            {discountBadge ? (
              <span
                style={{
                  borderRadius: 999,
                  background: '#ffe44d',
                  color: '#17130f',
                  border: '1.2px solid #111111',
                  padding: '4px 8px',
                  fontSize: 9,
                  fontWeight: 900,
                  whiteSpace: 'nowrap',
                }}
              >
                {discountBadge}
              </span>
            ) : null}
          </div>

          <div
            style={{
              fontSize: 15,
              fontWeight: 900,
              color: '#17130f',
              lineHeight: 1.15,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {master.name || master.title || 'Professional'}
          </div>

          <div
            style={{
              marginTop: 3,
              fontSize: 11,
              fontWeight: 700,
              color: '#6f675f',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {categoryLabel}
            {master.subcategory ? ` • ${master.subcategory}` : ''}
          </div>

          <div
            style={{
              marginTop: 5,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 11,
              fontWeight: 800,
              color: '#17130f',
            }}
          >
            <span>★ {typeof master.rating === 'number' ? master.rating.toFixed(1) : '4.8'}</span>
            <span>
              {tr.from} £{String(price).replace(/[^\d.]/g, '') || '45'}
            </span>
          </div>
        </div>
      </div>

      <div
        style={{
          marginTop: 10,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1.15fr',
          gap: 8,
        }}
      >
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onOpen();
          }}
          style={{
            height: 40,
            borderRadius: 14,
            border: '1.5px solid #111111',
            background: '#ffffff',
            color: '#17130f',
            fontSize: 12,
            fontWeight: 900,
            cursor: 'pointer',
            touchAction: 'manipulation',
          }}
        >
          {tr.view}
        </button>

        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onRoute();
          }}
          style={{
            height: 40,
            borderRadius: 14,
            border: '1.5px solid #111111',
            background: '#eef4ff',
            color: '#2563eb',
            fontSize: 12,
            fontWeight: 900,
            cursor: 'pointer',
            touchAction: 'manipulation',
          }}
        >
          {tr.route}
        </button>

        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onBook();
          }}
          style={{
            height: 40,
            borderRadius: 14,
            border: '1.5px solid #111111',
            background: '#55c75f',
            color: '#ffffff',
            fontSize: 12,
            fontWeight: 900,
            cursor: 'pointer',
            touchAction: 'manipulation',
          }}
        >
          {tr.bookNow}
        </button>
      </div>
    </div>
  );
}

function QrReceiveModal({
  language,
  currencySymbol,
  amount,
  note,
  generated,
  credited,
  onAmount,
  onNote,
  onGenerate,
  onCredit,
  onClose,
}: {
  language: AppLanguage;
  currencySymbol: string;
  amount: string;
  note: string;
  generated: boolean;
  credited: boolean;
  onAmount: (value: string) => void;
  onNote: (value: string) => void;
  onGenerate: () => void;
  onCredit: () => void;
  onClose: () => void;
}) {
  const value = Number(amount || 0);
  const safeAmount = Number.isFinite(value) && value > 0 ? value : 0;
  const requestId = useMemo(() => `olamep-pay-${Date.now()}`, []);
  const paymentPayload = `https://olamep.com/pay?to=site-wallet&amount=${encodeURIComponent(
    String(safeAmount)
  )}&currency=${encodeURIComponent(currencySymbol)}&note=${encodeURIComponent(
    note || 'Olamep QR payment'
  )}&request=${encodeURIComponent(requestId)}`;

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=12&data=${encodeURIComponent(
    paymentPayload
  )}`;

  const labels = {
    title:
      language === 'RU'
        ? 'QR приём платежа'
        : language === 'UA'
        ? 'QR прийом платежу'
        : 'QR payment receive',
    subtitle:
      language === 'RU'
        ? 'Задай сумму, создай QR и получи деньги на баланс сайта.'
        : language === 'UA'
        ? 'Вкажи суму, створи QR і отримай гроші на баланс сайту.'
        : 'Set an amount, generate a QR and receive money into the site balance.',
    amount:
      language === 'RU'
        ? 'Сумма'
        : language === 'UA'
        ? 'Сума'
        : 'Amount',
    note:
      language === 'RU'
        ? 'Назначение платежа'
        : language === 'UA'
        ? 'Призначення платежу'
        : 'Payment note',
    generate:
      language === 'RU'
        ? 'Создать QR'
        : language === 'UA'
        ? 'Створити QR'
        : 'Generate QR',
    received:
      language === 'RU'
        ? 'Платёж получен'
        : language === 'UA'
        ? 'Платіж отримано'
        : 'Payment received',
    credit:
      language === 'RU'
        ? 'Зачислить на баланс'
        : language === 'UA'
        ? 'Зарахувати на баланс'
        : 'Credit to balance',
    hint:
      language === 'RU'
        ? 'Сейчас это рабочий прототип: после нажатия деньги зачисляются в кошелёк сайта и появляются в истории.'
        : language === 'UA'
        ? 'Зараз це робочий прототип: після натискання гроші зараховуються в гаманець сайту та зʼявляються в історії.'
        : 'This is a working prototype: after pressing the button, money is credited to the site wallet and appears in history.',
    close:
      language === 'RU'
        ? 'Закрыть'
        : language === 'UA'
        ? 'Закрити'
        : 'Close',
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 8000,
        background: 'rgba(0,0,0,0.34)',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
      }}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 430,
          maxHeight: '88vh',
          overflowY: 'auto',
          borderTopLeftRadius: 30,
          borderTopRightRadius: 30,
          border: '3px solid #111111',
          borderBottom: 'none',
          background: '#ffffff',
          padding: '18px 18px calc(22px + env(safe-area-inset-bottom))',
          boxSizing: 'border-box',
          boxShadow: '0 -12px 34px rgba(0,0,0,0.2)',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 48px',
            gap: 10,
            alignItems: 'start',
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: 28,
                lineHeight: 1,
                fontWeight: 900,
                color: '#071b46',
                letterSpacing: '-0.8px',
              }}
            >
              {labels.title}
            </h2>
            <p
              style={{
                margin: '8px 0 0',
                fontSize: 13,
                lineHeight: 1.35,
                fontWeight: 800,
                color: '#657080',
              }}
            >
              {labels.subtitle}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              width: 48,
              height: 48,
              borderRadius: 999,
              border: '2.5px solid #111111',
              background: '#ffffff',
              color: '#071b46',
              fontSize: 24,
              fontWeight: 900,
              cursor: 'pointer',
            }}
          >
            ×
          </button>
        </div>

        <div
          style={{
            marginTop: 16,
            borderRadius: 24,
            border: '2.5px solid #111111',
            background: 'linear-gradient(135deg, #f0fff4 0%, #ffffff 50%, #eef4ff 100%)',
            padding: 14,
          }}
        >
          <label
            style={{
              display: 'grid',
              gap: 6,
              fontSize: 12,
              fontWeight: 900,
              color: '#657080',
            }}
          >
            <span>{labels.amount}</span>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '52px 1fr',
                borderRadius: 18,
                border: '2.5px solid #111111',
                overflow: 'hidden',
                background: '#ffffff',
              }}
            >
              <div
                style={{
                  minHeight: 54,
                  display: 'grid',
                  placeItems: 'center',
                  borderRight: '2.5px solid #111111',
                  fontSize: 24,
                  fontWeight: 900,
                  color: '#071b46',
                }}
              >
                {currencySymbol}
              </div>
              <input
                type="number"
                inputMode="decimal"
                min="1"
                value={amount}
                onChange={(event) => onAmount(event.target.value)}
                placeholder="25"
                style={{
                  border: 'none',
                  outline: 'none',
                  minHeight: 54,
                  padding: '0 14px',
                  fontSize: 24,
                  fontWeight: 900,
                  color: '#071b46',
                  background: 'transparent',
                }}
              />
            </div>
          </label>

          <label
            style={{
              marginTop: 12,
              display: 'grid',
              gap: 6,
              fontSize: 12,
              fontWeight: 900,
              color: '#657080',
            }}
          >
            <span>{labels.note}</span>
            <input
              value={note}
              onChange={(event) => onNote(event.target.value)}
              placeholder="Massage / booking / service"
              style={{
                width: '100%',
                minHeight: 48,
                boxSizing: 'border-box',
                borderRadius: 16,
                border: '2.5px solid #111111',
                background: '#ffffff',
                color: '#071b46',
                fontSize: 14,
                fontWeight: 900,
                padding: '0 12px',
              }}
            />
          </label>

          <button
            type="button"
            onClick={onGenerate}
            disabled={safeAmount <= 0}
            style={{
              marginTop: 14,
              width: '100%',
              minHeight: 52,
              borderRadius: 18,
              border: '2.5px solid #111111',
              background: safeAmount > 0 ? '#55c75f' : '#d8dce2',
              color: '#ffffff',
              fontSize: 16,
              fontWeight: 900,
              cursor: safeAmount > 0 ? 'pointer' : 'not-allowed',
              boxShadow: safeAmount > 0 ? '0 8px 18px rgba(85,199,95,0.28)' : 'none',
            }}
          >
            {labels.generate}
          </button>
        </div>

        {generated ? (
          <div
            style={{
              marginTop: 14,
              borderRadius: 26,
              border: '2.5px solid #111111',
              background: '#ffffff',
              padding: 14,
              textAlign: 'center',
            }}
          >
            <div
              style={{
                margin: '0 auto',
                width: 244,
                height: 244,
                borderRadius: 22,
                border: '2.5px solid #111111',
                background: '#ffffff',
                display: 'grid',
                placeItems: 'center',
                overflow: 'hidden',
              }}
            >
              <img
                src={qrUrl}
                alt="QR payment"
                style={{
                  width: 232,
                  height: 232,
                  display: 'block',
                }}
              />
            </div>

            <div
              style={{
                marginTop: 12,
                fontSize: 32,
                fontWeight: 900,
                color: '#071b46',
              }}
            >
              {currencySymbol}
              {safeAmount.toFixed(2)}
            </div>

            <div
              style={{
                marginTop: 4,
                fontSize: 13,
                fontWeight: 800,
                color: '#657080',
              }}
            >
              {note || 'Olamep QR payment'}
            </div>

            <div
              style={{
                marginTop: 12,
                borderRadius: 18,
                border: '2px solid #111111',
                background: '#fff4c7',
                padding: 10,
                fontSize: 12,
                lineHeight: 1.35,
                fontWeight: 800,
                color: '#071b46',
                textAlign: 'left',
              }}
            >
              {labels.hint}
            </div>

            <button
              type="button"
              onClick={onCredit}
              disabled={credited}
              style={{
                marginTop: 12,
                width: '100%',
                minHeight: 54,
                borderRadius: 18,
                border: '2.5px solid #111111',
                background: credited ? '#dcffe8' : '#071b46',
                color: credited ? '#008f3a' : '#ffffff',
                fontSize: 16,
                fontWeight: 900,
                cursor: credited ? 'default' : 'pointer',
              }}
            >
              {credited ? `✓ ${labels.received}` : labels.credit}
            </button>
          </div>
        ) : null}

        <button
          type="button"
          onClick={onClose}
          style={{
            marginTop: 14,
            width: '100%',
            minHeight: 50,
            borderRadius: 18,
            border: '2.5px solid #111111',
            background: '#ffffff',
            color: '#071b46',
            fontSize: 15,
            fontWeight: 900,
            cursor: 'pointer',
          }}
        >
          {labels.close}
        </button>
      </div>
    </div>
  );
}

function InviteFriendsModal({
  language,
  inviteCode,
  inviteLink,
  copied,
  onCopy,
  onShare,
  onClose,
}: {
  language: AppLanguage;
  inviteCode: string;
  inviteLink: string;
  copied: boolean;
  onCopy: () => void;
  onShare: () => void;
  onClose: () => void;
}) {
  const labels = {
    title:
      language === 'RU'
        ? 'Пригласи друзей'
        : language === 'UA'
        ? 'Запроси друзів'
        : 'Invite friends',
    subtitle:
      language === 'RU'
        ? 'Дай другу свой код или ссылку. Когда он присоединится, бонус появится на твоём балансе.'
        : language === 'UA'
        ? 'Дай другу свій код або посилання. Коли він приєднається, бонус зʼявиться на твоєму балансі.'
        : 'Share your code or link. When your friend joins, your bonus will appear in your balance.',
    code:
      language === 'RU'
        ? 'Твой invite code'
        : language === 'UA'
        ? 'Твій invite code'
        : 'Your invite code',
    copy:
      language === 'RU'
        ? 'Скопировать код'
        : language === 'UA'
        ? 'Скопіювати код'
        : 'Copy code',
    copied:
      language === 'RU'
        ? 'Скопировано'
        : language === 'UA'
        ? 'Скопійовано'
        : 'Copied',
    share:
      language === 'RU'
        ? 'Поделиться ссылкой'
        : language === 'UA'
        ? 'Поділитися посиланням'
        : 'Share invite link',
    bonus:
      language === 'RU'
        ? 'Бонус за приглашение'
        : language === 'UA'
        ? 'Бонус за запрошення'
        : 'Referral bonus',
    bonusText:
      language === 'RU'
        ? 'Друг получает приглашение, ты получаешь бонус после регистрации или первой активности.'
        : language === 'UA'
        ? 'Друг отримує запрошення, ти отримуєш бонус після реєстрації або першої активності.'
        : 'Your friend gets an invite, and you get a bonus after they join or complete their first action.',
    close:
      language === 'RU'
        ? 'Закрыть'
        : language === 'UA'
        ? 'Закрити'
        : 'Close',
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 8000,
        background: 'rgba(0,0,0,0.34)',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
      }}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 430,
          maxHeight: '88vh',
          overflowY: 'auto',
          borderTopLeftRadius: 30,
          borderTopRightRadius: 30,
          border: '3px solid #111111',
          borderBottom: 'none',
          background: '#ffffff',
          padding: '18px 18px calc(22px + env(safe-area-inset-bottom))',
          boxSizing: 'border-box',
          boxShadow: '0 -12px 34px rgba(0,0,0,0.2)',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 48px',
            gap: 10,
            alignItems: 'start',
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: 28,
                lineHeight: 1,
                fontWeight: 900,
                color: '#071b46',
                letterSpacing: '-0.8px',
              }}
            >
              {labels.title}
            </h2>
            <p
              style={{
                margin: '8px 0 0',
                fontSize: 13,
                lineHeight: 1.35,
                fontWeight: 800,
                color: '#657080',
              }}
            >
              {labels.subtitle}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              width: 48,
              height: 48,
              borderRadius: 999,
              border: '2.5px solid #111111',
              background: '#ffffff',
              color: '#071b46',
              fontSize: 24,
              fontWeight: 900,
              cursor: 'pointer',
            }}
          >
            ×
          </button>
        </div>

        <div
          style={{
            marginTop: 16,
            borderRadius: 26,
            border: '2.5px solid #111111',
            background: 'linear-gradient(135deg, #eef4ff 0%, #ffffff 45%, #dcffe8 100%)',
            padding: 14,
          }}
        >
          <div
            style={{
              fontSize: 12,
              fontWeight: 900,
              color: '#657080',
            }}
          >
            {labels.code}
          </div>

          <div
            style={{
              marginTop: 8,
              minHeight: 64,
              borderRadius: 20,
              border: '2.5px solid #111111',
              background: '#ffffff',
              color: '#071b46',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 26,
              fontWeight: 900,
              letterSpacing: '1px',
            }}
          >
            {inviteCode}
          </div>

          <div
            style={{
              marginTop: 10,
              borderRadius: 18,
              border: '2px solid #111111',
              background: '#fff4c7',
              padding: 10,
              fontSize: 12,
              lineHeight: 1.35,
              fontWeight: 800,
              color: '#071b46',
            }}
          >
            <strong>{labels.bonus}:</strong> {labels.bonusText}
          </div>

          <div
            style={{
              marginTop: 12,
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 9,
            }}
          >
            <button
              type="button"
              onClick={onCopy}
              style={{
                minHeight: 52,
                borderRadius: 18,
                border: '2.5px solid #111111',
                background: copied ? '#dcffe8' : '#ffffff',
                color: copied ? '#008f3a' : '#071b46',
                fontSize: 14,
                fontWeight: 900,
                cursor: 'pointer',
              }}
            >
              {copied ? `✓ ${labels.copied}` : labels.copy}
            </button>

            <button
              type="button"
              onClick={onShare}
              style={{
                minHeight: 52,
                borderRadius: 18,
                border: '2.5px solid #111111',
                background: '#55c75f',
                color: '#ffffff',
                fontSize: 14,
                fontWeight: 900,
                cursor: 'pointer',
                boxShadow: '0 8px 18px rgba(85,199,95,0.28)',
              }}
            >
              {labels.share}
            </button>
          </div>

          <div
            style={{
              marginTop: 12,
              borderRadius: 18,
              border: '2px solid #111111',
              background: '#ffffff',
              padding: 11,
              fontSize: 12,
              lineHeight: 1.35,
              fontWeight: 800,
              color: '#657080',
              wordBreak: 'break-all',
            }}
          >
            {inviteLink}
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          style={{
            marginTop: 14,
            width: '100%',
            minHeight: 50,
            borderRadius: 18,
            border: '2.5px solid #111111',
            background: '#ffffff',
            color: '#071b46',
            fontSize: 15,
            fontWeight: 900,
            cursor: 'pointer',
          }}
        >
          {labels.close}
        </button>
      </div>
    </div>
  );
}

export default function HomePage() {
  const router = useRouter();
  const baseMasters = getAllMasters();
  const searchWrapperRef = useRef<HTMLDivElement | null>(null);
  const promotionCardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const seenPromotionIdsRef = useRef<Set<string>>(new Set());

  const [search, setSearch] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState('beauty');
  const [activeSubcategory, setActiveSubcategory] = useState('');
  const [language, setLanguage] = useState<AppLanguage>(getSavedLanguage());
  const [mapMode] = useState<'map' | 'satellite'>('map');
  const [selectedMaster, setSelectedMaster] = useState<any | null>(null);
  const [mapResetKey, setMapResetKey] = useState(0);
  const [likedMasterIds, setLikedMasterIds] = useState<string[]>([]);
  const [likedFilterMode, setLikedFilterMode] = useState<'none' | 'category' | 'all'>('none');
  const [dealFilterMode, setDealFilterMode] = useState<DealFilterMode>('none');
  const [listings, setListings] = useState<ListingItem[]>([]);
  const [promotions, setPromotions] = useState<PromotionItem[]>([]);
  const [recenterToUserTrigger] = useState(0);
  const [searchLocation, setSearchLocation] = useState(getEffectiveSearchLocation());
  const [locationLabel, setLocationLabel] = useState(getEffectiveSearchLocation().label);
  const [regionVersion, setRegionVersion] = useState(0);
  const [currencyVersion, setCurrencyVersion] = useState(0);
  const [quickPanelOpen, setQuickPanelOpen] = useState(false);
  const [radiusSearch, setRadiusSearch] = useState<RadiusSearchConfig | null>(null);

  const [qrReceiveOpen, setQrReceiveOpen] = useState(false);
  const [qrAmount, setQrAmount] = useState('');
  const [qrNote, setQrNote] = useState('');
  const [qrGenerated, setQrGenerated] = useState(false);
  const [qrCredited, setQrCredited] = useState(false);

  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteCopied, setInviteCopied] = useState(false);

  const tr = t(language);
  const pageBackground = getAppBackground(language);

  const inviteCode = 'OLAMEP25';
  const inviteLink = `https://olamep.com/invite/${inviteCode}`;

  useEffect(() => {
    setRecentSearches(readRecentSearches());
  }, []);

  useEffect(() => {
    const syncAppContext = () => {
      setLanguage(getSavedLanguage());

      const effective = getEffectiveSearchLocation();
      setSearchLocation(effective);
      setLocationLabel(effective.label);

      setRegionVersion((prev) => prev + 1);
    };

    syncAppContext();

    window.addEventListener('focus', syncAppContext);
    window.addEventListener('storage', syncAppContext);

    const unsubscribe = subscribeToAppRegionSettings(syncAppContext);

    return () => {
      window.removeEventListener('focus', syncAppContext);
      window.removeEventListener('storage', syncAppContext);
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    refreshLiveCurrencyRates().finally(() => {
      setCurrencyVersion((prev) => prev + 1);
    });
  }, []);

  useEffect(() => {
    const handleOutside = (event: MouseEvent | TouchEvent) => {
      if (!searchWrapperRef.current) return;
      if (searchWrapperRef.current.contains(event.target as Node)) return;
      setSearchOpen(false);
    };

    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('touchstart', handleOutside);

    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('touchstart', handleOutside);
    };
  }, []);

  useEffect(() => {
    const loadListings = () => setListings(getListings());
    loadListings();
    return subscribeToListingsStore(loadListings);
  }, []);

  useEffect(() => {
    const loadLiked = () => setLikedMasterIds(getLikedMasterIds().map(String));
    loadLiked();
    return subscribeToLikedMasters(loadLiked);
  }, []);

  useEffect(() => {
    const loadPromotions = () => {
      setPromotions(
        getVisiblePromotionsForLocation(
          searchLocation.lat,
          searchLocation.lng,
          undefined,
          language
        )
      );
    };

    loadPromotions();
    const unsubscribe = subscribeToPromotionsStore(loadPromotions);

    return () => {
      unsubscribe();
    };
  }, [searchLocation.lat, searchLocation.lng, language, regionVersion, currencyVersion]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (promotions.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const element = entry.target as HTMLElement;
          const promoId = element.dataset.promoId;

          if (!promoId) return;
          if (seenPromotionIdsRef.current.has(promoId)) return;

          seenPromotionIdsRef.current.add(promoId);
          incrementPromotionViews(promoId);
        });
      },
      { threshold: 0.7 }
    );

    promotions.forEach((promo) => {
      const node = promotionCardRefs.current[promo.id];
      if (node) observer.observe(node);
    });

    return () => {
      observer.disconnect();
    };
  }, [promotions]);

  const listingMasters = useMemo(() => {
    return listings.map((item, index) => listingToMaster(item, index));
  }, [listings]);

  const allMasters = useMemo(() => {
    return [...listingMasters, ...baseMasters];
  }, [listingMasters, baseMasters]);

  const smartResults = useMemo(() => {
    const q = search.trim();
    if (!q) return [] as SmartSearchResult[];

    return searchAliases
      .map((item) => {
        const keywordScore = Math.max(
          ...item.keywords.map((keyword) => scoreTextMatch(q, keyword))
        );
        const labelScore = scoreTextMatch(q, item.label);
        const categoryScore = scoreTextMatch(q, item.categoryId);
        const subcategoryScore = scoreTextMatch(q, item.subcategory);

        return {
          item,
          score: Math.max(keywordScore, labelScore, categoryScore, subcategoryScore),
        };
      })
      .filter((item) => item.score >= 34)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map(({ item }) => ({
        type: 'smart' as const,
        id: `smart-${item.categoryId}-${item.subcategory || 'all'}-${item.label}`,
        label: item.label,
        categoryId: item.categoryId,
        subcategory: item.subcategory,
      }));
  }, [search]);

  const activeSearchIntent = useMemo(() => {
    const q = search.trim();
    if (!q) return null;
    return smartResults[0] || null;
  }, [search, smartResults]);

  const categoryResults = useMemo(() => {
    const q = search.trim();
    if (!q) return [] as CategorySearchResult[];

    return categories
      .map((item) => ({
        item,
        score: Math.max(
          scoreTextMatch(q, item.label),
          scoreTextMatch(q, item.shortLabel || ''),
          scoreTextMatch(q, item.id),
          ...item.subcategories.map((sub) => scoreTextMatch(q, sub))
        ),
      }))
      .filter((item) => item.score >= 34)
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)
      .map(({ item }) => ({
        type: 'category' as const,
        id: `category-${item.id}`,
        label: getCategoryLabel(item.id, language),
        categoryId: item.id,
      }));
  }, [search, language]);

  const subcategoryResults = useMemo(() => {
    const q = search.trim();
    if (!q) return [] as SubcategorySearchResult[];

    return categories
      .flatMap((item) =>
        item.subcategories.map((sub) => ({
          sub,
          categoryId: item.id,
          score: scoreTextMatch(q, sub),
        }))
      )
      .filter((item) => item.score >= 34)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map((item) => ({
        type: 'subcategory' as const,
        id: `subcategory-${item.categoryId}-${item.sub}`,
        label: item.sub,
        categoryId: item.categoryId,
      }));
  }, [search]);

  const proResults = useMemo(() => {
    const q = search.trim();
    if (!q) return [] as MasterSearchResult[];

    return allMasters
      .map((master: any) => {
        const score =
          scoreTextMatch(q, String(master.name || master.title || '')) * 1.5 +
          scoreTextMatch(q, String(master.subcategory || '')) * 1.3 +
          scoreTextMatch(q, String(master.description || '')) * 1.2 +
          scoreTextMatch(q, String(master.city || '')) +
          scoreTextMatch(q, String(master.category || ''));

        return { master, score };
      })
      .filter((item) => item.score >= 34)
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)
      .map(({ master }) => ({
        type: 'master' as const,
        id: `master-${master.id}`,
        label: master.name || master.title || 'Pro',
        categoryId: String(master.category || 'beauty'),
        master,
      }));
  }, [search, allMasters]);

  const searchedMasters = useMemo(() => {
    const q = search.trim();

    if (!q) return allMasters;

    if (activeSearchIntent) {
      return allMasters.filter((master: any) => {
        const masterCategory = String(master.category || '').toLowerCase().trim();
        const masterSubcategory = String(master.subcategory || '').toLowerCase().trim();
        const intentCategory = String(activeSearchIntent.categoryId || '').toLowerCase().trim();
        const intentSubcategory = String(activeSearchIntent.subcategory || '').toLowerCase().trim();

        if (masterCategory !== intentCategory) return false;
        if (!intentSubcategory) return true;

        return masterSubcategory === intentSubcategory;
      });
    }

    return allMasters.filter((master: any) => {
      const haystack = [
        master.name || '',
        master.title || '',
        master.city || '',
        master.subcategory || '',
        master.description || '',
        master.category || '',
      ].join(' ');

      return scoreTextMatch(q, haystack) >= 34;
    });
  }, [allMasters, search, activeSearchIntent]);

  const categoryFilteredMasters = useMemo(() => {
    const effectiveCategory = activeSearchIntent?.categoryId || activeCategory;
    const effectiveSubcategory =
      activeSearchIntent?.subcategory !== undefined && activeSearchIntent?.subcategory !== null
        ? activeSearchIntent.subcategory
        : activeSubcategory;

    return searchedMasters.filter((master: any) => {
      const masterCategory = String(master.category || '').toLowerCase().trim();
      const masterSubcategory = String(master.subcategory || '').toLowerCase().trim();

      const categoryOk = masterCategory === String(effectiveCategory || '').toLowerCase().trim();

      if (!categoryOk) return false;

      if (!effectiveSubcategory) return true;

      return masterSubcategory === String(effectiveSubcategory || '').toLowerCase().trim();
    });
  }, [searchedMasters, activeCategory, activeSubcategory, activeSearchIntent]);

  const categoryDealsCount = useMemo(() => {
    return promotions.filter((promo) => isPromotionInCategory(promo, activeCategory)).length;
  }, [promotions, activeCategory]);

  const allDealsCount = promotions.length;

  const filteredPromotions = useMemo(() => {
    if (dealFilterMode === 'category') {
      return promotions.filter((promo) => isPromotionInCategory(promo, activeCategory));
    }
    return promotions;
  }, [promotions, dealFilterMode, activeCategory]);

  const promotionMasters = useMemo(() => {
    if (dealFilterMode !== 'none') {
      const sourcePromotions =
        dealFilterMode === 'category'
          ? promotions.filter((promo) => isPromotionInCategory(promo, activeCategory))
          : promotions;

      const uniqueMasters = new Map<string, any>();

      sourcePromotions.forEach((promo) => {
        const matchedMaster = findPromotionMaster(promo, allMasters);
        if (!matchedMaster) return;

        const masterId = String(matchedMaster.id);
        const discountBadge = extractPromotionDiscountBadge(promo);

        uniqueMasters.set(masterId, {
          ...matchedMaster,
          discountBadge,
        });
      });

      return Array.from(uniqueMasters.values());
    }

    return [] as any[];
  }, [dealFilterMode, promotions, activeCategory, allMasters]);

  const promotionBadgeTextByMasterId = useMemo(() => {
    const entries = promotionMasters.map((master) => [
      String(master.id),
      String(master.discountBadge || 'SALE'),
    ]);
    return Object.fromEntries(entries);
  }, [promotionMasters]);

  const likedFilteredMasters = useMemo(() => {
    if (likedFilterMode === 'all') {
      return allMasters.filter((master: any) => likedMasterIds.includes(String(master.id)));
    }

    if (likedFilterMode === 'category') {
      return categoryFilteredMasters.filter((master: any) =>
        likedMasterIds.includes(String(master.id))
      );
    }

    return categoryFilteredMasters;
  }, [likedFilterMode, allMasters, categoryFilteredMasters, likedMasterIds]);

  const mapMastersBeforeRadius = useMemo(() => {
    if (dealFilterMode !== 'none') return promotionMasters;
    return likedFilteredMasters;
  }, [dealFilterMode, promotionMasters, likedFilteredMasters]);

  const mapMasters = useMemo(() => {
    if (!radiusSearch?.enabled) return mapMastersBeforeRadius;

    return mapMastersBeforeRadius.filter((master: any) =>
      isMasterInsideRadius(master, radiusSearch)
    );
  }, [mapMastersBeforeRadius, radiusSearch]);

  useEffect(() => {
    setSelectedMaster(null);
    setMapResetKey((prev) => prev + 1);
  }, [activeCategory, activeSubcategory, search, likedFilterMode, dealFilterMode]);

  const likedInCategoryCount = allMasters.filter(
    (master: any) =>
      String(master.category || '').toLowerCase().trim() === activeCategory &&
      likedMasterIds.includes(String(master.id))
  ).length;

  const likedAllCount = likedMasterIds.length;

  const hasAnyResults =
    smartResults.length > 0 ||
    categoryResults.length > 0 ||
    subcategoryResults.length > 0 ||
    proResults.length > 0 ||
    mapMasters.length > 0;

  const currencySymbol = getCurrencySymbolForLocation(locationLabel);

  const displayLikedInCategoryCount = likedInCategoryCount;
  const displayCategoryDealsCount = categoryDealsCount;
  const displayLikedAllCount = likedAllCount;
  const displayAllDealsCount = allDealsCount;

  const selectedMasterDiscountBadge = selectedMaster?.discountBadge
    ? String(selectedMaster.discountBadge)
    : promotionBadgeTextByMasterId[String(selectedMaster?.id || '')];

  const closeSelectedMasterCard = () => {
    setSelectedMaster(null);
    setMapResetKey((prev) => prev + 1);
  };

  const openQrReceive = () => {
    setQuickPanelOpen(false);
    setQrReceiveOpen(true);
    setQrGenerated(false);
    setQrCredited(false);
    if (!qrAmount) setQrAmount('25');
    if (!qrNote) setQrNote('Olamep payment');
  };

  const openInviteFriends = () => {
    setQuickPanelOpen(false);
    setInviteOpen(true);
    setInviteCopied(false);
  };

  const copyInviteCode = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(inviteCode);
      }
    } catch {
      // Safe fallback.
    }

    setInviteCopied(true);

    window.setTimeout(() => {
      setInviteCopied(false);
    }, 1600);
  };

  const shareInviteLink = async () => {
    const shareText =
      language === 'RU'
        ? `Присоединяйся к Olamep. Мой invite code: ${inviteCode}`
        : language === 'UA'
        ? `Приєднуйся до Olamep. Мій invite code: ${inviteCode}`
        : `Join Olamep. My invite code: ${inviteCode}`;

    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({
          title: 'Olamep',
          text: shareText,
          url: inviteLink,
        });
        return;
      }

      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(`${shareText} ${inviteLink}`);
      }

      setInviteCopied(true);

      window.setTimeout(() => {
        setInviteCopied(false);
      }, 1600);
    } catch {
      // Safe fallback.
    }
  };

  const creditQrPaymentToWallet = () => {
    const amount = Number(qrAmount || 0);

    if (!Number.isFinite(amount) || amount <= 0 || qrCredited) return;

    const current = getWalletState();

    const transaction: WalletTransaction = {
      id: `tx_qr_receive_${Date.now()}`,
      type: 'client_payment',
      title:
        language === 'RU'
          ? 'QR платёж от клиента'
          : language === 'UA'
          ? 'QR платіж від клієнта'
          : 'QR client payment',
      subtitle: qrNote.trim() || 'Olamep QR payment',
      amount,
      status: 'credited',
      createdAt: new Date().toISOString(),
    };

    setWalletState({
      ...current,
      availableBalance: current.availableBalance + amount,
      transactions: [transaction, ...current.transactions],
    });

    setQrCredited(true);
  };

  const selectSearchResult = (result: SearchResult) => {
    if (result.type === 'smart') {
      setActiveCategory(result.categoryId);
      setActiveSubcategory(result.subcategory);
      setLikedFilterMode('none');
      setDealFilterMode('none');
      setSearch(result.label);
      setSearchOpen(false);
      saveRecentSearch(result.label);
      setRecentSearches(readRecentSearches());
      return;
    }

    if (result.type === 'category') {
      setActiveCategory(result.categoryId);
      setActiveSubcategory('');
      setLikedFilterMode('none');
      setDealFilterMode('none');
      setSearch(result.label);
      setSearchOpen(false);
      saveRecentSearch(result.label);
      setRecentSearches(readRecentSearches());
      return;
    }

    if (result.type === 'subcategory') {
      setActiveCategory(result.categoryId);
      setActiveSubcategory(result.label);
      setLikedFilterMode('none');
      setDealFilterMode('none');
      setSearch(result.label);
      setSearchOpen(false);
      saveRecentSearch(result.label);
      setRecentSearches(readRecentSearches());
      return;
    }

    setActiveCategory(String(result.master.category || 'beauty'));
    setActiveSubcategory(result.master.subcategory || '');
    setLikedFilterMode('none');
    setDealFilterMode('none');
    setSelectedMaster(result.master);
    setSearch(result.label);
    setSearchOpen(false);
    saveRecentSearch(result.label);
    setRecentSearches(readRecentSearches());
  };

  const runQuickSearch = (value: string) => {
    setSearch(value);
    setSearchOpen(true);
    saveRecentSearch(value);
    setRecentSearches(readRecentSearches());
  };

  const openPromotionView = (promo: PromotionItem) => {
    incrementPromotionViews(promo.id);
    router.push(`/promotion/${promo.id}`);
  };

  const handleBookMaster = (master: any) => {
    const registered = isUserRegistered();

    savePendingGuestBooking(master);

    router.push(
      `/booking/guest?masterId=${encodeURIComponent(
        String(master?.id || '')
      )}&registered=${registered ? '1' : '0'}`
    );
  };

  const handleBookPromotion = (promo: PromotionItem) => {
    const matchedMaster = findPromotionMaster(promo, allMasters);
    const anyPromo = promo as any;

    const bookingMaster =
      matchedMaster || {
        id: anyPromo.masterId || anyPromo.listingId || promo.id,
        name: anyPromo.title || 'Promotion booking',
        title: anyPromo.title || 'Promotion booking',
        category: anyPromo.categoryId || activeCategory || 'beauty',
        subcategory: anyPromo.subtitle || '',
        price: anyPromo.price || anyPromo.priceFrom || '45',
        avatar: anyPromo.image || '',
      };

    handleBookMaster(bookingMaster);
  };

  const openRouteToMaster = (master: any) => {
    const query = encodeURIComponent(
      String(master.city || master.location || master.address || 'London')
    );
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        background: pageBackground,
        fontFamily: 'Arial, sans-serif',
        color: '#17130f',
        paddingBottom: 120,
        overflowX: 'hidden',
      }}
    >
      <style jsx global>{`
        @keyframes olamepTickerMove {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>

      <div
        style={{
          maxWidth: 430,
          margin: '0 auto',
          background: pageBackground,
        }}
      >
        <section style={{ padding: '7px 10px 0' }}>
          <div ref={searchWrapperRef} style={{ position: 'relative', zIndex: 1300 }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(0,1fr) 42px 42px 42px',
                gap: 6,
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  height: 42,
                  borderRadius: 17,
                  border: '2px solid #111111',
                  background: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 7,
                  padding: '0 12px',
                  minWidth: 0,
                  boxShadow: '0 2px 0 rgba(0,0,0,0.04)',
                }}
              >
                <span style={{ fontSize: 17, lineHeight: 1, color: '#9ca3af' }}>⌕</span>

                <input
                  value={search}
                  onFocus={() => setSearchOpen(true)}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setSearchOpen(true);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const first =
                        smartResults[0] ||
                        subcategoryResults[0] ||
                        categoryResults[0] ||
                        proResults[0];

                      if (first) {
                        selectSearchResult(first);
                      } else if (search.trim()) {
                        saveRecentSearch(search);
                        setRecentSearches(readRecentSearches());
                        setSearchOpen(false);
                      }
                    }
                  }}
                  placeholder={tr.searchPlaceholder}
                  style={{
                    flex: 1,
                    minWidth: 0,
                    border: 'none',
                    outline: 'none',
                    background: 'transparent',
                    fontSize: 10.5,
                    color: '#2b2f36',
                    fontWeight: 700,
                  }}
                />

                {search ? (
                  <button
                    onClick={() => {
                      setSearch('');
                      setSearchOpen(false);
                    }}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      fontSize: 14,
                      color: '#85909c',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    ✕
                  </button>
                ) : null}
              </div>

              <button
                onClick={() => router.push('/profile/language')}
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 15,
                  border: '2px solid #111111',
                  background: '#ffffff',
                  color: '#111111',
                  padding: 0,
                  fontSize: 8,
                  fontWeight: 900,
                  display: 'inline-flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 0,
                  cursor: 'pointer',
                  boxShadow: '0 2px 0 rgba(0,0,0,0.04)',
                }}
              >
                <span style={{ fontSize: 15, lineHeight: 1 }}>{languageFlag(language)}</span>
                <span>{language}</span>
              </button>

              <button
                onClick={() => router.push('/profile/currency')}
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 15,
                  border: '2px solid #111111',
                  background: '#ffffff',
                  color: '#111111',
                  padding: 0,
                  fontSize: 19,
                  fontWeight: 900,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 2px 0 rgba(0,0,0,0.04)',
                }}
              >
                {currencySymbol}
              </button>

              <button
                onClick={() => router.push('/profile/location')}
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 15,
                  border: '2px solid #111111',
                  background: '#ffffff',
                  color: '#111111',
                  padding: 0,
                  fontSize: 16,
                  fontWeight: 900,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 2px 0 rgba(0,0,0,0.04)',
                }}
              >
                ⌖
              </button>
            </div>

            <div style={{ marginTop: 7 }}>
              <BrightTicker language={language} />
            </div>

            {searchOpen ? (
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: 'calc(100% + 8px)',
                  background: 'rgba(255,255,255,0.98)',
                  border: '2px solid #111111',
                  borderRadius: 22,
                  boxShadow: '0 14px 34px rgba(0,0,0,0.12)',
                  padding: 12,
                  maxHeight: 380,
                  overflowY: 'auto',
                }}
              >
                {!search.trim() ? (
                  <>
                    {recentSearches.length > 0 ? (
                      <div style={{ marginBottom: 14 }}>
                        <div
                          style={{
                            fontSize: 12,
                            fontWeight: 900,
                            color: '#6c7480',
                            marginBottom: 8,
                          }}
                        >
                          {tr.recentSearches}
                        </div>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                          {recentSearches.map((item) => (
                            <button
                              key={item}
                              onClick={() => runQuickSearch(item)}
                              style={{
                                border: '1.4px solid #111111',
                                background: '#fff',
                                borderRadius: 999,
                                padding: '8px 12px',
                                fontSize: 13,
                                fontWeight: 800,
                                color: '#2a3442',
                                cursor: 'pointer',
                              }}
                            >
                              {item}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    <div>
                      <div
                        style={{
                          fontSize: 12,
                          fontWeight: 900,
                          color: '#6c7480',
                          marginBottom: 8,
                        }}
                      >
                        {tr.popularSearches}
                      </div>

                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {popularSearches.map((item) => (
                          <button
                            key={item}
                            onClick={() => runQuickSearch(item)}
                            style={{
                              border: '1.4px solid #111111',
                              background: '#fff7fb',
                              borderRadius: 999,
                              padding: '8px 12px',
                              fontSize: 13,
                              fontWeight: 900,
                              color: '#ff4f93',
                              cursor: 'pointer',
                            }}
                          >
                            {item}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                ) : !hasAnyResults ? (
                  <div
                    style={{
                      padding: '12px 6px',
                      fontSize: 14,
                      fontWeight: 800,
                      color: '#74808c',
                    }}
                  >
                    {tr.noResultsFound}
                  </div>
                ) : (
                  <>
                    {smartResults.length > 0 && (
                      <div style={{ marginBottom: 12 }}>
                        <div style={{ fontSize: 12, fontWeight: 900, color: '#6c7480', marginBottom: 8 }}>
                          {tr.smartMatches}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {smartResults.map((item) => (
                            <button
                              key={item.id}
                              onClick={() => selectSearchResult(item)}
                              style={{
                                border: '1.4px solid #111111',
                                background: '#fff7fb',
                                borderRadius: 14,
                                padding: '10px 12px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'flex-start',
                                gap: 2,
                                cursor: 'pointer',
                              }}
                            >
                              <span style={{ fontSize: 14, fontWeight: 900, color: '#263545' }}>
                                {item.label}
                              </span>
                              <span style={{ fontSize: 12, color: '#7d8691', fontWeight: 700 }}>
                                {getCategoryLabel(item.categoryId, language)}
                                {item.subcategory ? ` • ${item.subcategory}` : ''}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {categoryResults.length > 0 && (
                      <div style={{ marginBottom: 12 }}>
                        <div style={{ fontSize: 12, fontWeight: 900, color: '#6c7480', marginBottom: 8 }}>
                          {tr.categories}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {categoryResults.map((item) => (
                            <button
                              key={item.id}
                              onClick={() => selectSearchResult(item)}
                              style={{
                                border: '1.4px solid #111111',
                                background: '#fff',
                                borderRadius: 14,
                                padding: '10px 12px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'flex-start',
                                gap: 2,
                                cursor: 'pointer',
                              }}
                            >
                              <span style={{ fontSize: 14, fontWeight: 900, color: '#263545' }}>
                                {item.label}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {subcategoryResults.length > 0 && (
                      <div style={{ marginBottom: 12 }}>
                        <div style={{ fontSize: 12, fontWeight: 900, color: '#6c7480', marginBottom: 8 }}>
                          {tr.services}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {subcategoryResults.map((item) => (
                            <button
                              key={item.id}
                              onClick={() => selectSearchResult(item)}
                              style={{
                                border: '1.4px solid #111111',
                                background: '#fff',
                                borderRadius: 14,
                                padding: '10px 12px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'flex-start',
                                gap: 2,
                                cursor: 'pointer',
                              }}
                            >
                              <span style={{ fontSize: 14, fontWeight: 900, color: '#263545' }}>
                                {item.label}
                              </span>
                              <span style={{ fontSize: 12, color: '#7d8691', fontWeight: 700 }}>
                                {getCategoryLabel(item.categoryId, language)}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {proResults.length > 0 && (
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 900, color: '#6c7480', marginBottom: 8 }}>
                          {tr.pros}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {proResults.map((item) => (
                            <button
                              key={item.id}
                              onClick={() => selectSearchResult(item)}
                              style={{
                                border: '1.4px solid #111111',
                                background: '#fff',
                                borderRadius: 14,
                                padding: '10px 12px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'flex-start',
                                gap: 2,
                                cursor: 'pointer',
                              }}
                            >
                              <span style={{ fontSize: 14, fontWeight: 900, color: '#263545' }}>
                                {item.label}
                              </span>
                              <span style={{ fontSize: 12, color: '#7d8691', fontWeight: 700 }}>
                                {getCategoryLabel(item.categoryId, language)}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            ) : null}
          </div>
        </section>

        <section style={{ padding: '5px 0 0' }}>
          <TopCategoriesBar
            language={language}
            activeCategory={activeSearchIntent?.categoryId || activeCategory}
            activeSubcategory={activeSearchIntent?.subcategory || activeSubcategory}
            onSelectCategory={(category) => {
              setActiveCategory(category);
              setActiveSubcategory('');
              setSearch('');
              setSearchOpen(false);
              setLikedFilterMode('none');
              setDealFilterMode('none');
              closeSelectedMasterCard();
            }}
            onSelectSubcategory={(subcategory) => {
              setActiveSubcategory(subcategory);
              setSearch('');
              setSearchOpen(false);
              setLikedFilterMode('none');
              setDealFilterMode('none');
              closeSelectedMasterCard();
            }}
            onClearSubcategory={() => {
              setActiveSubcategory('');
              closeSelectedMasterCard();
            }}
          />
        </section>

        <section style={{ padding: '8px 4px 0' }}>
          <div
            style={{
              borderRadius: 24,
              border: '2.4px solid #111111',
              background: '#ffffff',
              boxShadow: '0 8px 22px rgba(0,0,0,0.08)',
              position: 'relative',
              overflow: 'visible',
            }}
          >
            <div
              style={{
                height: 'clamp(520px, calc(100vh - 286px), 660px)',
                minHeight: 520,
                position: 'relative',
                overflow: 'hidden',
                borderRadius: 22,
              }}
            >
              <RealMap
                key={`real-map-${mapResetKey}`}
                masters={mapMasters}
                mapMode={mapMode}
                activeCategory={activeSearchIntent?.categoryId || activeCategory}
                selectedMasterId={selectedMaster?.id ?? null}
                likedMasterIds={likedMasterIds}
                recenterToUserTrigger={recenterToUserTrigger}
                language={language}
                promotionBadgeTextByMasterId={promotionBadgeTextByMasterId}
                radiusSearch={radiusSearch}
                onRadiusSearchApply={(config) => {
                  setRadiusSearch(config);
                  setSelectedMaster(null);
                }}
                onRadiusSearchClear={() => {
                  setRadiusSearch(null);
                  setSelectedMaster(null);
                }}
                onMasterSelect={(master) => {
                  setSelectedMaster(master);
                }}
                onMapBackgroundClick={closeSelectedMasterCard}
                onToggleLike={(master) => {
                  toggleLikedMaster(String(master.id));
                }}
                onViewMaster={(master) => {
                  router.push(`/master/${master.id}`);
                }}
                onBookMaster={(master) => {
                  handleBookMaster(master);
                }}
              />

              <QuickActionsPanel
                open={quickPanelOpen}
                onToggle={() => setQuickPanelOpen((prev) => !prev)}
                onQrReceive={openQrReceive}
                onInvite={openInviteFriends}
                onFavourite={() => {
                  setDealFilterMode('none');
                  closeSelectedMasterCard();
                  setLikedFilterMode((prev) => (prev === 'category' ? 'none' : 'category'));
                }}
                onAllFavourite={() => {
                  setDealFilterMode('none');
                  closeSelectedMasterCard();
                  setLikedFilterMode((prev) => (prev === 'all' ? 'none' : 'all'));
                }}
                onHotOffers={() => {
                  setLikedFilterMode('none');
                  closeSelectedMasterCard();
                  setDealFilterMode((prev) => (prev === 'category' ? 'none' : 'category'));
                }}
                onAllHotOffers={() => {
                  setLikedFilterMode('none');
                  closeSelectedMasterCard();
                  setDealFilterMode((prev) => (prev === 'all' ? 'none' : 'all'));
                }}
                favouriteCount={displayLikedInCategoryCount}
                allFavouriteCount={displayLikedAllCount}
                hotOffersCount={displayCategoryDealsCount}
                allHotOffersCount={displayAllDealsCount}
                favouriteActive={likedFilterMode === 'category'}
                allFavouriteActive={likedFilterMode === 'all'}
                hotOffersActive={dealFilterMode === 'category'}
                allHotOffersActive={dealFilterMode === 'all'}
              />

              {selectedMaster ? (
                <MasterMiniCard
                  master={selectedMaster}
                  language={language}
                  liked={likedMasterIds.includes(String(selectedMaster.id))}
                  discountBadge={selectedMasterDiscountBadge}
                  onClose={closeSelectedMasterCard}
                  onLike={() => toggleLikedMaster(String(selectedMaster.id))}
                  onOpen={() => router.push(`/master/${selectedMaster.id}`)}
                  onRoute={() => openRouteToMaster(selectedMaster)}
                  onBook={() => handleBookMaster(selectedMaster)}
                />
              ) : null}
            </div>
          </div>
        </section>

        {filteredPromotions.length > 0 && (
          <section style={{ padding: '20px 0 0' }}>
            <div style={{ background: pageBackground, padding: '0 0 12px' }}>
              <div
                style={{
                  padding: '0 12px 0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 10,
                }}
              >
                <h2
                  style={{
                    margin: 0,
                    fontSize: 16,
                    fontWeight: 900,
                    color: '#111111',
                  }}
                >
                  {language === 'RU'
                    ? 'Горячие предложения рядом'
                    : language === 'UA'
                    ? 'Гарячі пропозиції поруч'
                    : language === 'ES'
                    ? 'Ofertas cerca de ti'
                    : 'Hot offers near you'}
                </h2>

                <button
                  onClick={() => router.push('/explore')}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    fontSize: 14,
                    color: '#ff4f93',
                    fontWeight: 900,
                    lineHeight: 1,
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  {language === 'RU'
                    ? 'Все ›'
                    : language === 'UA'
                    ? 'Усі ›'
                    : language === 'ES'
                    ? 'Ver todo ›'
                    : 'See all ›'}
                </button>
              </div>

              <div
                style={{
                  marginTop: 12,
                  display: 'flex',
                  gap: 10,
                  overflowX: 'auto',
                  overflowY: 'hidden',
                  padding: '0 12px 4px',
                  WebkitOverflowScrolling: 'touch',
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none',
                }}
              >
                {filteredPromotions.slice(0, 8).map((promo) => (
                  <div
                    key={promo.id}
                    ref={(node) => {
                      promotionCardRefs.current[promo.id] = node;
                    }}
                    data-promo-id={promo.id}
                  >
                    <PromoCard
                      promo={promo}
                      language={language}
                      onOpen={() => openPromotionView(promo)}
                      onBook={() => handleBookPromotion(promo)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>

      {qrReceiveOpen ? (
        <QrReceiveModal
          language={language}
          currencySymbol={currencySymbol}
          amount={qrAmount}
          note={qrNote}
          generated={qrGenerated}
          credited={qrCredited}
          onAmount={(value) => {
            setQrAmount(value);
            setQrGenerated(false);
            setQrCredited(false);
          }}
          onNote={(value) => {
            setQrNote(value);
            setQrGenerated(false);
            setQrCredited(false);
          }}
          onGenerate={() => {
            setQrGenerated(true);
            setQrCredited(false);
          }}
          onCredit={creditQrPaymentToWallet}
          onClose={() => setQrReceiveOpen(false)}
        />
      ) : null}

      {inviteOpen ? (
        <InviteFriendsModal
          language={language}
          inviteCode={inviteCode}
          inviteLink={inviteLink}
          copied={inviteCopied}
          onCopy={copyInviteCode}
          onShare={shareInviteLink}
          onClose={() => setInviteOpen(false)}
        />
      ) : null}

      <BottomNav />
    </main>
  );
}
