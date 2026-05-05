export type SmartSearchIntent = {
  label: string;
  categoryId: string;
  subcategory: string;
  keywords: string[];
};

export const smartSearchDictionary: SmartSearchIntent[] = [
  {
    label: 'Laser hair removal',
    categoryId: 'beauty',
    subcategory: 'Aesthetics',
    keywords: [
      'laser hair removal',
      'laser epilation',
      'hair removal',
      'epilation',
      'waxing',
      'depilation',
      'лазерная эпиляция',
      'лазерна епіляція',
      'эпиляция',
      'епіляція',
      'депиляция',
      'удаление волос',
      'воск',
      'шугаринг',
      'depilación láser',
      'depilacion laser',
      'depilación',
      'depilacion',
      'épilation laser',
      'epilation laser',
      'haarentfernung',
      'laser haarentfernung',
      'depilacja laserowa',
      'depilace laserem',
    ],
  },
  {
    label: 'Dog grooming',
    categoryId: 'pets',
    subcategory: 'Grooming',
    keywords: [
      'dog grooming',
      'pet grooming',
      'grooming',
      'groomer',
      'dog groomer',
      'pet haircut',
      'dog haircut',
      'dog wash',
      'dog washing',
      'грумер',
      'груминг',
      'стрижка собак',
      'стрижка собаки',
      'мойка собак',
      'мытье собак',
      'мытьё собак',
      'уход за собакой',
      'уход за животными',
      'собачий грумер',
      'перукар для собак',
      'peluquería canina',
      'peluqueria canina',
      'toilettage chien',
      'hundefriseur',
      'psi fryzjer',
      'stříhání psů',
    ],
  },
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
      'animal',
      'animals',
      'собака',
      'собаки',
      'собак',
      'кот',
      'кошка',
      'кошки',
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
      'pes',
      'kočka',
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
      'готель для собак',
      'hotel para perros',
      'cuidador de perros',
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
      'мойка ковров',
      'чистка ковров',
      'чистка ковра',
      'ковры',
      'ковер',
      'ковёр',
      'химчистка ковров',
      'почистить ковер',
      'почистить ковёр',
      'помыть ковер',
      'помыть ковёр',
      'прання килимів',
      'чистка килимів',
      'limpieza de alfombras',
      'limpieza alfombras',
      'limpieza',
      'limpiesa',
      'limpeza',
      'alfombra',
      'alfombras',
      'nettoyage tapis',
      'teppichreinigung',
      'pranie dywanów',
      'čištění koberců',
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
      'limpieza',
      'limpieza casa',
      'limpiesa',
      'limpeza',
      'nettoyage',
      'ménage',
      'reinigung',
      'putzfrau',
      'sprzątanie',
      'úklid',
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
    label: 'Hair extensions',
    categoryId: 'beauty',
    subcategory: 'Hair',
    keywords: [
      'hair extensions',
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
      'extensiones de cabello',
      'peluquería',
      'peluqueria',
      'coiffure',
      'cheveux',
      'friseur',
      'haarverlängerung',
      'przedłużanie włosów',
      'fryzjer',
      'kadeřník',
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
      'маникюр',
      'педикюр',
      'гель лак',
      'шеллак',
      'манікюр',
      'uñas',
      'unas',
      'manicura',
      'pedicura',
      'ongles',
      'manucure',
      'nägel',
      'maniküre',
      'paznokcie',
      'nehty',
      'manikúra',
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
      'masaż',
      'masér',
      'masáž',
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
      'mudanza',
      'transporte',
      'furgoneta',
      'livraison',
      'déménagement',
      'umzug',
      'transport',
      'przeprowadzka',
      'stěhování',
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
];

export function normalizeSearchText(value: string) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ё/g, 'е')
    .replace(/[\u2019']/g, '')
    .replace(/[^a-zа-яіїєґ0-9\s-]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function getSearchTokens(value: string) {
  return normalizeSearchText(value)
    .split(' ')
    .map((item) => item.trim())
    .filter((item) => item.length >= 2);
}

export function levenshteinDistance(a: string, b: string) {
  const first = normalizeSearchText(a);
  const second = normalizeSearchText(b);

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

export function fuzzyTokenScore(queryToken: string, targetToken: string) {
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

export function scoreSmartTextMatch(query: string, target: string) {
  const q = normalizeSearchText(query);
  const targetValue = normalizeSearchText(target);

  if (!q || !targetValue) return 0;
  if (targetValue === q) return 140;
  if (targetValue.startsWith(q)) return 112;
  if (targetValue.includes(q)) return 92;
  if (q.includes(targetValue) && targetValue.length >= 4) return 82;

  const queryTokens = getSearchTokens(q);
  const targetTokens = getSearchTokens(targetValue);

  if (queryTokens.length === 0 || targetTokens.length === 0) return 0;

  let score = 0;

  queryTokens.forEach((queryToken) => {
    const tokenScores = targetTokens.map((targetToken) =>
      fuzzyTokenScore(queryToken, targetToken)
    );

    score += Math.max(0, ...tokenScores);
  });

  const allQueryTokensMatched = queryTokens.every((queryToken) =>
    targetTokens.some((targetToken) => fuzzyTokenScore(queryToken, targetToken) >= 28)
  );

  if (allQueryTokensMatched) {
    score += 35;
  }

  return score;
}

export function findSmartSearchIntents(query: string) {
  const q = query.trim();

  if (!q) return [];

  return smartSearchDictionary
    .map((item) => {
      const keywordScore = Math.max(
        0,
        ...item.keywords.map((keyword) => scoreSmartTextMatch(q, keyword))
      );

      const labelScore = scoreSmartTextMatch(q, item.label);
      const categoryScore = scoreSmartTextMatch(q, item.categoryId);
      const subcategoryScore = scoreSmartTextMatch(q, item.subcategory);

      return {
        ...item,
        score: Math.max(keywordScore, labelScore, categoryScore, subcategoryScore),
      };
    })
    .filter((item) => item.score >= 34)
    .sort((a, b) => b.score - a.score);
}

export function buildMasterSearchText(master: any) {
  return [
    master?.name || '',
    master?.title || '',
    master?.city || '',
    master?.category || '',
    master?.subcategory || '',
    master?.description || '',
    master?.address || '',
    master?.social || '',
    ...(Array.isArray(master?.services)
      ? master.services.flatMap((service: any) => [
          service?.title || '',
          service?.description || '',
          service?.slug || '',
        ])
      : []),
    ...(Array.isArray(master?.gallery) ? master.gallery : []),
  ].join(' ');
}

export function scoreMasterBySearch(query: string, master: any) {
  return scoreSmartTextMatch(query, buildMasterSearchText(master));
}
