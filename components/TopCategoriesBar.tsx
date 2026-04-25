'use client';

import { useMemo, useState } from 'react';
import { categories } from '../services/categories';
import type { AppLanguage } from '../services/i18n';

type TopCategoriesBarProps = {
  activeCategory: string;
  activeSubcategory?: string;
  language: AppLanguage;
  onSelectCategory: (category: string) => void;
  onSelectSubcategory?: (subcategory: string) => void;
  onClearSubcategory?: () => void;
};

function getCategoryLabel(category: any, language: AppLanguage) {
  const map: Record<string, Partial<Record<AppLanguage, string>>> = {
    more: {
      EN: 'More',
      ES: 'Más',
      RU: 'Ещё',
      UA: 'Ще',
      CZ: 'Více',
      DE: 'Mehr',
      IT: 'Altro',
      FR: 'Plus',
      AR: 'المزيد',
      PL: 'Więcej',
    },
    beauty: {
      EN: 'Beauty',
      ES: 'Belleza',
      RU: 'Красота',
      UA: 'Краса',
      CZ: 'Krása',
      DE: 'Beauty',
      IT: 'Beauty',
      FR: 'Beauté',
      AR: 'الجمال',
      PL: 'Uroda',
    },
    barber: {
      EN: 'Barber',
      ES: 'Barbero',
      RU: 'Барбер',
      UA: 'Барбер',
      CZ: 'Barber',
      DE: 'Barber',
      IT: 'Barber',
      FR: 'Barbier',
      AR: 'حلاقة',
      PL: 'Barber',
    },
    wellness: {
      EN: 'Wellness',
      ES: 'Bienestar',
      RU: 'Велнес',
      UA: 'Велнес',
      CZ: 'Wellness',
      DE: 'Wellness',
      IT: 'Benessere',
      FR: 'Bien-être',
      AR: 'عافية',
      PL: 'Wellness',
    },
    food: {
      EN: 'Food',
      ES: 'Comida',
      RU: 'Еда',
      UA: 'Їжа',
      CZ: 'Jídlo',
      DE: 'Essen',
      IT: 'Cibo',
      FR: 'Cuisine',
      AR: 'طعام',
      PL: 'Jedzenie',
    },
    home: {
      EN: 'Home',
      ES: 'Hogar',
      RU: 'Дом',
      UA: 'Дім',
      CZ: 'Domov',
      DE: 'Zuhause',
      IT: 'Casa',
      FR: 'Maison',
      AR: 'المنزل',
      PL: 'Dom',
    },
    repairs: {
      EN: 'Repairs',
      ES: 'Reparaciones',
      RU: 'Ремонт',
      UA: 'Ремонт',
      CZ: 'Opravy',
      DE: 'Reparaturen',
      IT: 'Riparazioni',
      FR: 'Réparations',
      AR: 'إصلاحات',
      PL: 'Naprawy',
    },
    tech: {
      EN: 'Tech',
      ES: 'Tecnología',
      RU: 'Техника',
      UA: 'Техніка',
      CZ: 'Technika',
      DE: 'Technik',
      IT: 'Tech',
      FR: 'Tech',
      AR: 'تقنية',
      PL: 'Technika',
    },
    pets: {
      EN: 'Pets',
      ES: 'Mascotas',
      RU: 'Питомцы',
      UA: 'Тварини',
      CZ: 'Mazlíčci',
      DE: 'Haustiere',
      IT: 'Animali',
      FR: 'Animaux',
      AR: 'حيوانات',
      PL: 'Zwierzęta',
    },
    fashion: {
      EN: 'Fashion',
      ES: 'Moda',
      RU: 'Мода',
      UA: 'Мода',
      CZ: 'Móda',
      DE: 'Mode',
      IT: 'Moda',
      FR: 'Mode',
      AR: 'موضة',
      PL: 'Moda',
    },
    auto: {
      EN: 'Auto',
      ES: 'Auto',
      RU: 'Авто',
      UA: 'Авто',
      CZ: 'Auto',
      DE: 'Auto',
      IT: 'Auto',
      FR: 'Auto',
      AR: 'سيارات',
      PL: 'Auto',
    },
    moving: {
      EN: 'Moving',
      ES: 'Mudanza',
      RU: 'Переезд',
      UA: 'Переїзд',
      CZ: 'Stěhování',
      DE: 'Umzug',
      IT: 'Trasloco',
      FR: 'Déménagement',
      AR: 'نقل',
      PL: 'Przeprowadzka',
    },
    fitness: {
      EN: 'Fitness',
      ES: 'Fitness',
      RU: 'Фитнес',
      UA: 'Фітнес',
      CZ: 'Fitness',
      DE: 'Fitness',
      IT: 'Fitness',
      FR: 'Fitness',
      AR: 'لياقة',
      PL: 'Fitness',
    },
    education: {
      EN: 'Education',
      ES: 'Educación',
      RU: 'Обучение',
      UA: 'Освіта',
      CZ: 'Vzdělání',
      DE: 'Bildung',
      IT: 'Formazione',
      FR: 'Éducation',
      AR: 'تعليم',
      PL: 'Edukacja',
    },
    events: {
      EN: 'Events',
      ES: 'Eventos',
      RU: 'События',
      UA: 'Події',
      CZ: 'Události',
      DE: 'Events',
      IT: 'Eventi',
      FR: 'Événements',
      AR: 'فعاليات',
      PL: 'Wydarzenia',
    },
    activities: {
      EN: 'Activities',
      ES: 'Actividades',
      RU: 'Активности',
      UA: 'Активності',
      CZ: 'Aktivity',
      DE: 'Aktivitäten',
      IT: 'Attività',
      FR: 'Activités',
      AR: 'أنشطة',
      PL: 'Aktywności',
    },
    creative: {
      EN: 'Creative',
      ES: 'Creativo',
      RU: 'Креатив',
      UA: 'Креатив',
      CZ: 'Kreativa',
      DE: 'Kreativ',
      IT: 'Creativo',
      FR: 'Créatif',
      AR: 'إبداعي',
      PL: 'Kreatywne',
    },
    other: {
      EN: 'Other',
      ES: 'Otro',
      RU: 'Другое',
      UA: 'Інше',
      CZ: 'Jiné',
      DE: 'Andere',
      IT: 'Altro',
      FR: 'Autre',
      AR: 'أخرى',
      PL: 'Inne',
    },
  };

  return (
    map[String(category.id || '').toLowerCase()]?.[language] ||
    category.shortLabel ||
    category.label ||
    String(category.id || '')
  );
}

function getSubcategoryLabel(value: string, language: AppLanguage) {
  const dict: Record<string, Partial<Record<AppLanguage, string>>> = {
    Hair: {
      RU: 'Волосы',
      UA: 'Волосся',
      ES: 'Cabello',
      CZ: 'Vlasy',
      DE: 'Haare',
      IT: 'Capelli',
      FR: 'Cheveux',
      AR: 'الشعر',
      PL: 'Włosy',
    },
    'Brows & Lashes': {
      RU: 'Брови и ресницы',
      UA: 'Брови та вії',
      ES: 'Cejas y pestañas',
      CZ: 'Obočí a řasy',
      DE: 'Augenbrauen & Wimpern',
      IT: 'Sopracciglia e ciglia',
      FR: 'Sourcils et cils',
      AR: 'الحواجب والرموش',
      PL: 'Brwi i rzęsy',
    },
    Nails: {
      RU: 'Ногти',
      UA: 'Нігті',
      ES: 'Uñas',
      CZ: 'Nehty',
      DE: 'Nägel',
      IT: 'Unghie',
      FR: 'Ongles',
      AR: 'الأظافر',
      PL: 'Paznokcie',
    },
    Makeup: {
      RU: 'Макияж',
      UA: 'Макіяж',
      ES: 'Maquillaje',
      CZ: 'Make-up',
      DE: 'Make-up',
      IT: 'Make-up',
      FR: 'Maquillage',
      AR: 'مكياج',
      PL: 'Makijaż',
    },
    Skincare: {
      RU: 'Уход за кожей',
      UA: 'Догляд за шкірою',
      ES: 'Cuidado de la piel',
      CZ: 'Péče o pleť',
      DE: 'Hautpflege',
      IT: 'Cura della pelle',
      FR: 'Soin de la peau',
      AR: 'العناية بالبشرة',
      PL: 'Pielęgnacja skóry',
    },
    Aesthetics: {
      RU: 'Эстетика',
      UA: 'Естетика',
      ES: 'Estética',
      CZ: 'Estetika',
      DE: 'Ästhetik',
      IT: 'Estetica',
      FR: 'Esthétique',
      AR: 'التجميل',
      PL: 'Estetyka',
    },
    Piercing: {
      RU: 'Пирсинг',
      UA: 'Пірсинг',
      ES: 'Piercing',
      CZ: 'Piercing',
      DE: 'Piercing',
      IT: 'Piercing',
      FR: 'Piercing',
      AR: 'ثقب الجسم',
      PL: 'Piercing',
    },
    Tattoo: {
      RU: 'Тату',
      UA: 'Тату',
      ES: 'Tatuaje',
      CZ: 'Tetování',
      DE: 'Tattoo',
      IT: 'Tatuaggio',
      FR: 'Tatouage',
      AR: 'وشم',
      PL: 'Tatuaż',
    },
    'Tattoo Removal': {
      RU: 'Удаление тату',
      UA: 'Видалення тату',
      ES: 'Eliminación de tatuajes',
      CZ: 'Odstranění tetování',
      DE: 'Tattoo-Entfernung',
      IT: 'Rimozione tatuaggio',
      FR: 'Détatouage',
      AR: 'إزالة الوشم',
      PL: 'Usuwanie tatuażu',
    },

    Haircut: {
      RU: 'Стрижка',
      UA: 'Стрижка',
      ES: 'Corte de pelo',
      CZ: 'Střih',
      DE: 'Haarschnitt',
      IT: 'Taglio',
      FR: 'Coupe',
      AR: 'قص الشعر',
      PL: 'Strzyżenie',
    },
    'Beard Trim': {
      RU: 'Подравнивание бороды',
      UA: 'Підрівнювання бороди',
      ES: 'Recorte de barba',
      CZ: 'Úprava vousů',
      DE: 'Bart trimmen',
      IT: 'Regolazione barba',
      FR: 'Taille de barbe',
      AR: 'تهذيب اللحية',
      PL: 'Przycinanie brody',
    },
    Shave: {
      RU: 'Бритьё',
      UA: 'Гоління',
      ES: 'Afeitado',
      CZ: 'Holení',
      DE: 'Rasur',
      IT: 'Rasatura',
      FR: 'Rasage',
      AR: 'حلاقة',
      PL: 'Golenie',
    },
    Fade: {
      RU: 'Фейд',
      UA: 'Фейд',
      ES: 'Fade',
      CZ: 'Fade',
      DE: 'Fade',
      IT: 'Fade',
      FR: 'Fade',
      AR: 'فيد',
      PL: 'Fade',
    },
    'Kids Haircut': {
      RU: 'Детская стрижка',
      UA: 'Дитяча стрижка',
      ES: 'Corte infantil',
      CZ: 'Dětský střih',
      DE: 'Kinderhaarschnitt',
      IT: 'Taglio bambino',
      FR: 'Coupe enfant',
      AR: 'قص أطفال',
      PL: 'Strzyżenie dziecięce',
    },
    Styling: {
      RU: 'Укладка',
      UA: 'Укладка',
      ES: 'Peinado',
      CZ: 'Styling',
      DE: 'Styling',
      IT: 'Styling',
      FR: 'Coiffage',
      AR: 'تصفيف',
      PL: 'Stylizacja',
    },

    Massage: {
      RU: 'Массаж',
      UA: 'Масаж',
      ES: 'Masaje',
      CZ: 'Masáž',
      DE: 'Massage',
      IT: 'Massaggio',
      FR: 'Massage',
      AR: 'مساج',
      PL: 'Masaż',
    },
    Spa: {
      RU: 'Спа',
      UA: 'Спа',
      ES: 'Spa',
      CZ: 'Spa',
      DE: 'Spa',
      IT: 'Spa',
      FR: 'Spa',
      AR: 'سبا',
      PL: 'Spa',
    },
    Relaxation: {
      RU: 'Релакс',
      UA: 'Релакс',
      ES: 'Relajación',
      CZ: 'Relaxace',
      DE: 'Entspannung',
      IT: 'Relax',
      FR: 'Relaxation',
      AR: 'استرخاء',
      PL: 'Relaks',
    },
    Recovery: {
      RU: 'Восстановление',
      UA: 'Відновлення',
      ES: 'Recuperación',
      CZ: 'Regenerace',
      DE: 'Erholung',
      IT: 'Recupero',
      FR: 'Récupération',
      AR: 'تعافٍ',
      PL: 'Regeneracja',
    },

    'Private Chef': {
      RU: 'Шеф-повар на дом',
      UA: 'Шеф-кухар додому',
      ES: 'Chef a domicilio',
      CZ: 'Soukromý šéfkuchař',
      DE: 'Privatkoch',
      IT: 'Chef a domicilio',
      FR: 'Chef à domicile',
      AR: 'شيف منزلي',
      PL: 'Prywatny kucharz',
    },
    Catering: {
      RU: 'Кейтеринг',
      UA: 'Кейтеринг',
      ES: 'Catering',
      CZ: 'Catering',
      DE: 'Catering',
      IT: 'Catering',
      FR: 'Traiteur',
      AR: 'تموين',
      PL: 'Catering',
    },
    'Home Dinner': {
      RU: 'Ужин на дому',
      UA: 'Вечеря вдома',
      ES: 'Cena en casa',
      CZ: 'Večeře doma',
      DE: 'Dinner zuhause',
      IT: 'Cena a casa',
      FR: 'Dîner à domicile',
      AR: 'عشاء منزلي',
      PL: 'Kolacja w domu',
    },
    'Meal Prep': {
      RU: 'Готовка на неделю',
      UA: 'Приготування їжі',
      ES: 'Preparación de comida',
      CZ: 'Příprava jídel',
      DE: 'Meal Prep',
      IT: 'Meal prep',
      FR: 'Préparation repas',
      AR: 'تحضير الوجبات',
      PL: 'Meal prep',
    },
    'Table Booking': {
      RU: 'Бронирование столика',
      UA: 'Бронювання столика',
      ES: 'Reserva de mesa',
      CZ: 'Rezervace stolu',
      DE: 'Tischreservierung',
      IT: 'Prenotazione tavolo',
      FR: 'Réservation de table',
      AR: 'حجز طاولة',
      PL: 'Rezerwacja stolika',
    },
    Restaurant: {
      RU: 'Ресторан',
      UA: 'Ресторан',
      ES: 'Restaurante',
      CZ: 'Restaurace',
      DE: 'Restaurant',
      IT: 'Ristorante',
      FR: 'Restaurant',
      AR: 'مطعم',
      PL: 'Restauracja',
    },
    Bar: {
      RU: 'Бар',
      UA: 'Бар',
      ES: 'Bar',
      CZ: 'Bar',
      DE: 'Bar',
      IT: 'Bar',
      FR: 'Bar',
      AR: 'بار',
      PL: 'Bar',
    },

    Cleaning: {
      RU: 'Уборка',
      UA: 'Прибирання',
      ES: 'Limpieza',
      CZ: 'Úklid',
      DE: 'Reinigung',
      IT: 'Pulizia',
      FR: 'Nettoyage',
      AR: 'تنظيف',
      PL: 'Sprzątanie',
    },
    'Deep Cleaning': {
      RU: 'Глубокая уборка',
      UA: 'Глибоке прибирання',
      ES: 'Limpieza profunda',
      CZ: 'Hloubkové čištění',
      DE: 'Tiefenreinigung',
      IT: 'Pulizia profonda',
      FR: 'Nettoyage en profondeur',
      AR: 'تنظيف عميق',
      PL: 'Dogłębne czyszczenie',
    },
    Handyman: {
      RU: 'Мастер на час',
      UA: 'Майстер на годину',
      ES: 'Manitas',
      CZ: 'Hodinový manžel',
      DE: 'Handwerker',
      IT: 'Tuttofare',
      FR: 'Bricoleur',
      AR: 'عامل صيانة',
      PL: 'Złota rączka',
    },
    'Phone Repair': {
      RU: 'Ремонт телефона',
      UA: 'Ремонт телефону',
      ES: 'Reparación de teléfono',
      CZ: 'Oprava telefonu',
      DE: 'Handyreparatur',
      IT: 'Riparazione telefono',
      FR: 'Réparation téléphone',
      AR: 'إصلاح الهاتف',
      PL: 'Naprawa telefonu',
    },
    'Computer Repair': {
      RU: 'Ремонт компьютера',
      UA: 'Ремонт комп’ютера',
      ES: 'Reparación de ordenador',
      CZ: 'Oprava počítače',
      DE: 'Computerreparatur',
      IT: 'Riparazione computer',
      FR: 'Réparation ordinateur',
      AR: 'إصلاح الكمبيوتر',
      PL: 'Naprawa komputera',
    },
    Grooming: {
      RU: 'Груминг',
      UA: 'Грумінг',
      ES: 'Peluquería',
      CZ: 'Grooming',
      DE: 'Grooming',
      IT: 'Toelettatura',
      FR: 'Toilettage',
      AR: 'تنظيف الحيوانات',
      PL: 'Grooming',
    },
    'Dog Walking': {
      RU: 'Выгул собак',
      UA: 'Вигул собак',
      ES: 'Paseo de perros',
      CZ: 'Venčení psů',
      DE: 'Gassi-Service',
      IT: 'Passeggiata cani',
      FR: 'Promenade de chiens',
      AR: 'تمشية الكلاب',
      PL: 'Wyprowadzanie psów',
    },
    'Pet Sitting': {
      RU: 'Передержка питомцев',
      UA: 'Перетримка тварин',
      ES: 'Cuidado de mascotas',
      CZ: 'Hlídání mazlíčků',
      DE: 'Tiersitting',
      IT: 'Pet sitting',
      FR: 'Garde d’animaux',
      AR: 'رعاية الحيوانات',
      PL: 'Opieka nad zwierzętami',
    },
    'Car Wash': {
      RU: 'Мойка авто',
      UA: 'Мийка авто',
      ES: 'Lavado de coche',
      CZ: 'Mytí auta',
      DE: 'Autowäsche',
      IT: 'Lavaggio auto',
      FR: 'Lavage auto',
      AR: 'غسيل السيارة',
      PL: 'Mycie auta',
    },
    Courier: {
      RU: 'Курьер',
      UA: 'Курʼєр',
      ES: 'Mensajería',
      CZ: 'Kurýr',
      DE: 'Kurier',
      IT: 'Corriere',
      FR: 'Coursier',
      AR: 'توصيل',
      PL: 'Kurier',
    },
    Yoga: {
      RU: 'Йога',
      UA: 'Йога',
      ES: 'Yoga',
      CZ: 'Jóga',
      DE: 'Yoga',
      IT: 'Yoga',
      FR: 'Yoga',
      AR: 'يوغا',
      PL: 'Joga',
    },
    Tutoring: {
      RU: 'Репетиторство',
      UA: 'Репетиторство',
      ES: 'Tutoría',
      CZ: 'Doučování',
      DE: 'Nachhilfe',
      IT: 'Tutoraggio',
      FR: 'Tutorat',
      AR: 'دروس خصوصية',
      PL: 'Korepetycje',
    },
    Photography: {
      RU: 'Фотография',
      UA: 'Фотографія',
      ES: 'Fotografía',
      CZ: 'Fotografie',
      DE: 'Fotografie',
      IT: 'Fotografia',
      FR: 'Photographie',
      AR: 'تصوير',
      PL: 'Fotografia',
    },
    Other: {
      RU: 'Другое',
      UA: 'Інше',
      ES: 'Otro',
      CZ: 'Jiné',
      DE: 'Andere',
      IT: 'Altro',
      FR: 'Autre',
      AR: 'أخرى',
      PL: 'Inne',
    },
  };

  return dict[value]?.[language] || value;
}

function getSheetTexts(language: AppLanguage) {
  if (language === 'RU') {
    return {
      title: 'Все категории',
      subtitle: 'Выберите категорию',
      subTitle: 'Подкатегории',
      allInCategory: 'Все в категории',
      back: 'Назад',
    };
  }

  if (language === 'UA') {
    return {
      title: 'Усі категорії',
      subtitle: 'Оберіть категорію',
      subTitle: 'Підкатегорії',
      allInCategory: 'Усе в категорії',
      back: 'Назад',
    };
  }

  if (language === 'ES') {
    return {
      title: 'Todas las categorías',
      subtitle: 'Elige una categoría',
      subTitle: 'Subcategorías',
      allInCategory: 'Todo en la categoría',
      back: 'Atrás',
    };
  }

  if (language === 'CZ') {
    return {
      title: 'Všechny kategorie',
      subtitle: 'Vyberte kategorii',
      subTitle: 'Podkategorie',
      allInCategory: 'Vše v kategorii',
      back: 'Zpět',
    };
  }

  if (language === 'DE') {
    return {
      title: 'Alle Kategorien',
      subtitle: 'Kategorie wählen',
      subTitle: 'Unterkategorien',
      allInCategory: 'Alles in Kategorie',
      back: 'Zurück',
    };
  }

  if (language === 'PL') {
    return {
      title: 'Wszystkie kategorie',
      subtitle: 'Wybierz kategorię',
      subTitle: 'Podkategorie',
      allInCategory: 'Wszystko w kategorii',
      back: 'Wstecz',
    };
  }

  return {
    title: 'All categories',
    subtitle: 'Choose category',
    subTitle: 'Subcategories',
    allInCategory: 'All in category',
    back: 'Back',
  };
}

function getCategoryVisual(category: any): { type: 'image' | 'emoji'; value: string } | null {
  const id = String(category?.id || '').toLowerCase();

  const localImageMap: Record<string, string> = {
    more: '/ui/categories/more.png',
    beauty: '/ui/categories/beauty.png',
    barber: '/ui/categories/barber.png',
    wellness: '/ui/categories/wellness.png',
    home: '/ui/categories/home.png',
    repairs: '/ui/categories/repairs.png',
    tech: '/ui/categories/tech.png',
    pets: '/ui/categories/pets.png',
    fashion: '/ui/categories/fashion.png',
    auto: '/ui/categories/auto.png',
    moving: '/ui/categories/moving.png',
    fitness: '/ui/categories/fitness.png',
    education: '/ui/categories/education.png',
    events: '/ui/categories/events.png',
    activities: '/ui/categories/activities.png',
    creative: '/ui/categories/creative.png',
  };

  if (localImageMap[id]) {
    return { type: 'image', value: localImageMap[id] };
  }

  if (typeof category?.icon === 'string' && category.icon.trim()) {
    return { type: 'emoji', value: category.icon };
  }

  if (id === 'food') return { type: 'emoji', value: '🍽️' };
  if (id === 'other') return { type: 'emoji', value: '✨' };

  return { type: 'emoji', value: '⬜' };
}

function getLanguageAccent(language: AppLanguage) {
  switch (language) {
    case 'RU':
      return { border: '#0039a6', glow: 'rgba(0,57,166,0.15)' };
    case 'CZ':
      return { border: '#d7141a', glow: 'rgba(215,20,26,0.15)' };
    case 'DE':
      return { border: '#ffce00', glow: 'rgba(255,206,0,0.17)' };
    case 'PL':
      return { border: '#dc143c', glow: 'rgba(220,20,60,0.15)' };
    case 'UA':
      return { border: '#0057b7', glow: 'rgba(0,87,183,0.15)' };
    case 'ES':
      return { border: '#c60b1e', glow: 'rgba(198,11,30,0.15)' };
    case 'FR':
      return { border: '#0055a4', glow: 'rgba(0,85,164,0.15)' };
    case 'IT':
      return { border: '#009246', glow: 'rgba(0,146,70,0.15)' };
    case 'AR':
      return { border: '#007a3d', glow: 'rgba(0,122,61,0.15)' };
    default:
      return { border: '#c8102e', glow: 'rgba(200,16,46,0.15)' };
  }
}

export default function TopCategoriesBar({
  activeCategory,
  activeSubcategory,
  language,
  onSelectCategory,
  onSelectSubcategory,
  onClearSubcategory,
}: TopCategoriesBarProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedSheetCategoryId, setSelectedSheetCategoryId] = useState<string | null>(null);

  const filteredCategories = useMemo(() => {
    return categories.filter((item: any) => String(item.id).toLowerCase() !== 'more');
  }, []);

  const visibleCategories = useMemo(() => {
    return [{ id: 'more', label: 'More', shortLabel: 'More', icon: '•••' }, ...filteredCategories.slice(0, 7)];
  }, [filteredCategories]);

  const selectedSheetCategory = useMemo(() => {
    if (!selectedSheetCategoryId) return null;
    return filteredCategories.find((item: any) => String(item.id) === selectedSheetCategoryId) || null;
  }, [filteredCategories, selectedSheetCategoryId]);

  const accent = getLanguageAccent(language);
  const sheetText = getSheetTexts(language);

  const closeSheet = () => {
    setSelectedSheetCategoryId(null);
    setSheetOpen(false);
  };

  const selectCategoryOnly = (categoryId: string) => {
    onSelectCategory(categoryId);
    onClearSubcategory?.();
    closeSheet();
  };

  const selectSubcategory = (categoryId: string, subcategory: string) => {
    onSelectCategory(categoryId);
    onSelectSubcategory?.(subcategory);
    closeSheet();
  };

  return (
    <>
      <div style={{ padding: '0 12px' }}>
        <div
          style={{
            display: 'flex',
            gap: 10,
            overflowX: 'auto',
            overflowY: 'hidden',
            padding: '0 1px 2px',
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {visibleCategories.map((category: any) => {
            const categoryId = String(category.id);
            const isMore = categoryId === 'more';
            const isActive = !isMore && activeCategory === categoryId;
            const label = getCategoryLabel(category, language);
            const visual = getCategoryVisual(category);

            return (
              <button
                key={categoryId}
                type="button"
                onClick={() => {
                  if (isMore) {
                    setSelectedSheetCategoryId(null);
                    setSheetOpen(true);
                    return;
                  }

                  onSelectCategory(categoryId);
                  onClearSubcategory?.();
                }}
                style={{
                  border: 'none',
                  background: 'transparent',
                  padding: 0,
                  cursor: 'pointer',
                  minWidth: 74,
                  flexShrink: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <div
                  style={{
                    width: 74,
                    height: 74,
                    borderRadius: 22,
                    border: isActive ? `1.8px solid ${accent.border}` : '1.2px solid #cfc8be',
                    background: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: isActive
                      ? `0 0 0 4px ${accent.glow}, 0 2px 8px rgba(0,0,0,0.03)`
                      : '0 2px 8px rgba(0,0,0,0.03)',
                    overflow: 'hidden',
                  }}
                >
                  {visual?.type === 'image' ? (
                    <img
                      src={visual.value}
                      alt={label}
                      style={{
                        width: '76%',
                        height: '76%',
                        objectFit: 'contain',
                        display: 'block',
                      }}
                    />
                  ) : (
                    <span style={{ fontSize: isMore ? 26 : 34, lineHeight: 1 }}>
                      {visual?.value || '⬜'}
                    </span>
                  )}
                </div>

                <span
                  style={{
                    marginTop: 8,
                    fontSize: 11,
                    fontWeight: isActive ? 900 : 700,
                    color: '#1f2937',
                    textAlign: 'center',
                    lineHeight: 1.1,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {sheetOpen ? (
        <div
          onClick={closeSheet}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 2500,
            background: 'rgba(17,17,17,0.38)',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            padding: '0 12px calc(18px + env(safe-area-inset-bottom))',
            boxSizing: 'border-box',
          }}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 430,
              maxHeight: '78vh',
              background: '#fffefa',
              border: '2px solid #111111',
              borderRadius: 28,
              overflow: 'hidden',
              boxShadow: '0 20px 48px rgba(0,0,0,0.22)',
            }}
          >
            <div
              style={{
                padding: '18px 18px 14px',
                borderBottom: '1.5px solid #eee7dc',
                display: 'grid',
                gridTemplateColumns: '1fr 42px',
                gap: 12,
                alignItems: 'center',
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 25,
                    fontWeight: 900,
                    color: '#17130f',
                    lineHeight: 1.1,
                  }}
                >
                  {selectedSheetCategory
                    ? getCategoryLabel(selectedSheetCategory, language)
                    : sheetText.title}
                </div>

                <div
                  style={{
                    marginTop: 5,
                    fontSize: 13,
                    fontWeight: 700,
                    color: '#756b61',
                  }}
                >
                  {selectedSheetCategory ? sheetText.subTitle : sheetText.subtitle}
                </div>
              </div>

              <button
                type="button"
                onClick={closeSheet}
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 999,
                  border: '1.6px solid #111111',
                  background: '#ffffff',
                  color: '#17130f',
                  fontSize: 22,
                  fontWeight: 900,
                  cursor: 'pointer',
                }}
              >
                ×
              </button>
            </div>

            {!selectedSheetCategory ? (
              <div
                style={{
                  padding: 14,
                  overflowY: 'auto',
                  maxHeight: 'calc(78vh - 92px)',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {filteredCategories.map((category: any) => {
                    const categoryId = String(category.id);
                    const label = getCategoryLabel(category, language);
                    const visual = getCategoryVisual(category);
                    const isActive = activeCategory === categoryId;

                    return (
                      <button
                        key={categoryId}
                        type="button"
                        onClick={() => setSelectedSheetCategoryId(categoryId)}
                        style={{
                          width: '100%',
                          minHeight: 70,
                          borderRadius: 20,
                          border: isActive ? `2px solid ${accent.border}` : '1.5px solid #111111',
                          background: isActive ? accent.glow : '#ffffff',
                          padding: '10px 12px',
                          display: 'grid',
                          gridTemplateColumns: '54px 1fr auto',
                          alignItems: 'center',
                          gap: 12,
                          textAlign: 'left',
                          cursor: 'pointer',
                        }}
                      >
                        <div
                          style={{
                            width: 54,
                            height: 54,
                            borderRadius: 17,
                            border: '1.2px solid #d8d2c8',
                            background: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden',
                          }}
                        >
                          {visual?.type === 'image' ? (
                            <img
                              src={visual.value}
                              alt={label}
                              style={{
                                width: '76%',
                                height: '76%',
                                objectFit: 'contain',
                              }}
                            />
                          ) : (
                            <span style={{ fontSize: 30 }}>{visual?.value || '⬜'}</span>
                          )}
                        </div>

                        <div>
                          <div
                            style={{
                              fontSize: 18,
                              fontWeight: 900,
                              color: '#17130f',
                            }}
                          >
                            {label}
                          </div>

                          <div
                            style={{
                              marginTop: 4,
                              fontSize: 12,
                              fontWeight: 700,
                              color: '#756b61',
                            }}
                          >
                            {Array.isArray(category.subcategories)
                              ? `${category.subcategories.length} ${sheetText.subTitle.toLowerCase()}`
                              : sheetText.subTitle}
                          </div>
                        </div>

                        <div
                          style={{
                            fontSize: 26,
                            fontWeight: 900,
                            color: '#17130f',
                          }}
                        >
                          ›
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div
                style={{
                  padding: 14,
                  overflowY: 'auto',
                  maxHeight: 'calc(78vh - 92px)',
                }}
              >
                <button
                  type="button"
                  onClick={() => setSelectedSheetCategoryId(null)}
                  style={{
                    width: '100%',
                    height: 50,
                    borderRadius: 18,
                    border: '1.5px solid #111111',
                    background: '#ffffff',
                    color: '#17130f',
                    fontSize: 16,
                    fontWeight: 900,
                    cursor: 'pointer',
                    marginBottom: 12,
                  }}
                >
                  ← {sheetText.back}
                </button>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <button
                    type="button"
                    onClick={() => selectCategoryOnly(String(selectedSheetCategory.id))}
                    style={{
                      width: '100%',
                      minHeight: 58,
                      borderRadius: 18,
                      border:
                        !activeSubcategory && activeCategory === String(selectedSheetCategory.id)
                          ? `2px solid ${accent.border}`
                          : '1.5px solid #111111',
                      background:
                        !activeSubcategory && activeCategory === String(selectedSheetCategory.id)
                          ? accent.glow
                          : '#ffffff',
                      color: '#17130f',
                      fontSize: 17,
                      fontWeight: 900,
                      textAlign: 'left',
                      padding: '0 16px',
                      cursor: 'pointer',
                    }}
                  >
                    {sheetText.allInCategory}
                  </button>

                  {(selectedSheetCategory.subcategories || []).map((subcategory: string) => {
                    const isActiveSub =
                      activeCategory === String(selectedSheetCategory.id) &&
                      activeSubcategory === subcategory;

                    return (
                      <button
                        key={`${selectedSheetCategory.id}-${subcategory}`}
                        type="button"
                        onClick={() => selectSubcategory(String(selectedSheetCategory.id), subcategory)}
                        style={{
                          width: '100%',
                          minHeight: 58,
                          borderRadius: 18,
                          border: isActiveSub
                            ? `2px solid ${accent.border}`
                            : '1.5px solid #d8d2c8',
                          background: isActiveSub ? accent.glow : '#ffffff',
                          color: '#17130f',
                          fontSize: 16,
                          fontWeight: 900,
                          textAlign: 'left',
                          padding: '0 16px',
                          cursor: 'pointer',
                        }}
                      >
                        {getSubcategoryLabel(subcategory, language)}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
