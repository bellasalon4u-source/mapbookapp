'use client';

import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { categories } from '../services/categories';
import { t, type AppLanguage } from '../services/i18n';

type TopCategoriesBarProps = {
  activeCategory: string;
  activeSubcategory?: string;
  language: AppLanguage;
  onSelectCategory: (category: string) => void;
  onSelectSubcategory: (subcategory: string) => void;
  onClearSubcategory: () => void;
};

const horizontalOrder = [
  'beauty',
  'barber',
  'wellness',
  'home',
  'repairs',
  'tech',
  'pets',
  'fashion',
  'auto',
  'moving',
  'fitness',
  'education',
  'events',
  'activities',
  'creative',
];

const iconSrcMap: Record<string, string> = {
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

const colorMap: Record<string, string> = {
  beauty: '#ff4f93',
  barber: '#2d98ff',
  wellness: '#32c957',
  home: '#ff9f1a',
  repairs: '#f4b400',
  tech: '#9b5cff',
  pets: '#28c7d9',
  fashion: '#43d94d',
  auto: '#43d94d',
  moving: '#43d94d',
  fitness: '#43d94d',
  education: '#7d52ff',
  events: '#43d94d',
  activities: '#43d94d',
  creative: '#43d94d',
  more: '#173552',
};

function translateCategoryLabel(categoryId: string, language: AppLanguage, fallback?: string) {
  const map: Record<string, Record<AppLanguage, string>> = {
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
      UA: 'Навчання',
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
  };

  return map[categoryId]?.[language] || fallback || categoryId;
}

function translateSubcategory(value: string, language: AppLanguage) {
  const dict: Record<string, Record<AppLanguage, string>> = {
    Hair: { EN: 'Hair', ES: 'Cabello', RU: 'Волосы', UA: 'Волосся', CZ: 'Vlasy', DE: 'Haare', IT: 'Capelli', FR: 'Cheveux', AR: 'الشعر', PL: 'Włosy' },
    'Brows & Lashes': { EN: 'Brows & Lashes', ES: 'Cejas y pestañas', RU: 'Брови и ресницы', UA: 'Брови та вії', CZ: 'Obočí a řasy', DE: 'Augenbrauen & Wimpern', IT: 'Sopracciglia e ciglia', FR: 'Sourcils et cils', AR: 'الحواجب والرموش', PL: 'Brwi i rzęsy' },
    Nails: { EN: 'Nails', ES: 'Uñas', RU: 'Ногти', UA: 'Нігті', CZ: 'Nehty', DE: 'Nägel', IT: 'Unghie', FR: 'Ongles', AR: 'الأظافر', PL: 'Paznokcie' },
    Makeup: { EN: 'Makeup', ES: 'Maquillaje', RU: 'Макияж', UA: 'Макіяж', CZ: 'Make-up', DE: 'Make-up', IT: 'Make-up', FR: 'Maquillage', AR: 'مكياж', PL: 'Makijaż' },
    Skincare: { EN: 'Skincare', ES: 'Cuidado de la piel', RU: 'Уход за кожей', UA: 'Догляд за шкірою', CZ: 'Péče o pleť', DE: 'Hautpflege', IT: 'Cura della pelle', FR: 'Soin de la peau', AR: 'العناية بالبشرة', PL: 'Pielęgnacja skóry' },
    Aesthetics: { EN: 'Aesthetics', ES: 'Estética', RU: 'Эстетика', UA: 'Естетика', CZ: 'Estetika', DE: 'Ästhetik', IT: 'Estetica', FR: 'Esthétique', AR: 'التجميل', PL: 'Estetyka' },
    Haircut: { EN: 'Haircut', ES: 'Corte de pelo', RU: 'Стрижка', UA: 'Стрижка', CZ: 'Střih', DE: 'Haarschnitt', IT: 'Taglio', FR: 'Coupe', AR: 'قص الشعر', PL: 'Strzyżenie' },
    'Beard Trim': { EN: 'Beard Trim', ES: 'Recorte de barba', RU: 'Подравнивание бороды', UA: 'Підрівнювання бороди', CZ: 'Úprava vousů', DE: 'Bart trimmen', IT: 'Regolazione barba', FR: 'Taille de barbe', AR: 'تهذيب اللحية', PL: 'Przycinanie brody' },
    Shave: { EN: 'Shave', ES: 'Afeitado', RU: 'Бритьё', UA: 'Гоління', CZ: 'Holení', DE: 'Rasur', IT: 'Rasatura', FR: 'Rasage', AR: 'حلاقة', PL: 'Golenie' },
    Fade: { EN: 'Fade', ES: 'Fade', RU: 'Фейд', UA: 'Фейд', CZ: 'Fade', DE: 'Fade', IT: 'Fade', FR: 'Fade', AR: 'فيد', PL: 'Fade' },
    'Kids Haircut': { EN: 'Kids Haircut', ES: 'Corte infantil', RU: 'Детская стрижка', UA: 'Дитяча стрижка', CZ: 'Dětský střih', DE: 'Kinderhaarschnitt', IT: 'Taglio bambino', FR: 'Coupe enfant', AR: 'قص أطفال', PL: 'Strzyżenie dziecięce' },
    Styling: { EN: 'Styling', ES: 'Peinado', RU: 'Укладка', UA: 'Укладка', CZ: 'Styling', DE: 'Styling', IT: 'Styling', FR: 'Coiffage', AR: 'تصفيف', PL: 'Stylizacja' },
    Massage: { EN: 'Massage', ES: 'Masaje', RU: 'Массаж', UA: 'Масаж', CZ: 'Masáž', DE: 'Massage', IT: 'Massaggio', FR: 'Massage', AR: 'مساج', PL: 'Masaż' },
    Spa: { EN: 'Spa', ES: 'Spa', RU: 'Спа', UA: 'Спа', CZ: 'Spa', DE: 'Spa', IT: 'Spa', FR: 'Spa', AR: 'سبا', PL: 'Spa' },
    Relaxation: { EN: 'Relaxation', ES: 'Relajación', RU: 'Релакс', UA: 'Релакс', CZ: 'Relaxace', DE: 'Entspannung', IT: 'Relax', FR: 'Relaxation', AR: 'استرخاء', PL: 'Relaks' },
    Recovery: { EN: 'Recovery', ES: 'Recuperación', RU: 'Восстановление', UA: 'Відновлення', CZ: 'Regenerace', DE: 'Erholung', IT: 'Recupero', FR: 'Récupération', AR: 'تعافٍ', PL: 'Regeneracja' },
    'Holistic Care': { EN: 'Holistic Care', ES: 'Cuidado holístico', RU: 'Холистический уход', UA: 'Холістичний догляд', CZ: 'Holistická péče', DE: 'Ganzheitliche Pflege', IT: 'Cura olistica', FR: 'Soin holistique', AR: 'رعاية شمولية', PL: 'Opieka holistyczna' },
    'Therapy Support': { EN: 'Therapy Support', ES: 'Apoyo terapéutico', RU: 'Терапевтическая помощь', UA: 'Терапевтична підтримка', CZ: 'Terapeutická podpora', DE: 'Therapie-Unterstützung', IT: 'Supporto terapeutico', FR: 'Soutien thérapeutique', AR: 'دعم علاجي', PL: 'Wsparcie terapeutyczne' },
    Cleaning: { EN: 'Cleaning', ES: 'Limpieza', RU: 'Уборка', UA: 'Прибирання', CZ: 'Úklid', DE: 'Reinigung', IT: 'Pulizia', FR: 'Nettoyage', AR: 'تنظيف', PL: 'Sprzątanie' },
    'Deep Cleaning': { EN: 'Deep Cleaning', ES: 'Limpieza profunda', RU: 'Глубокая уборка', UA: 'Глибоке прибирання', CZ: 'Hloubkové čištění', DE: 'Tiefenreinigung', IT: 'Pulizia profonda', FR: 'Nettoyage en profondeur', AR: 'تنظيف عميق', PL: 'Dogłębne czyszczenie' },
    'Garden Help': { EN: 'Garden Help', ES: 'Ayuda en jardín', RU: 'Помощь в саду', UA: 'Допомога в саду', CZ: 'Pomoc na zahradě', DE: 'Gartenhilfe', IT: 'Aiuto in giardino', FR: 'Aide au jardin', AR: 'مساعدة في الحديقة', PL: 'Pomoc w ogrodzie' },
    Handyman: { EN: 'Handyman', ES: 'Manitas', RU: 'Мастер на час', UA: 'Майстер на годину', CZ: 'Hodinový manžel', DE: 'Handwerker', IT: 'Tuttofare', FR: 'Bricoleur', AR: 'عامل صيانة', PL: 'Złota rączka' },
    'Furniture Assembly': { EN: 'Furniture Assembly', ES: 'Montaje de muebles', RU: 'Сборка мебели', UA: 'Збірка меблів', CZ: 'Montáž nábytku', DE: 'Möbelmontage', IT: 'Montaggio mobili', FR: 'Montage de meubles', AR: 'تركيب الأثاث', PL: 'Montaż mebli' },
    'Home Help': { EN: 'Home Help', ES: 'Ayuda en casa', RU: 'Помощь по дому', UA: 'Допомога по дому', CZ: 'Pomoc v domácnosti', DE: 'Haushaltshilfe', IT: 'Aiuto domestico', FR: 'Aide à domicile', AR: 'مساعدة منزلية', PL: 'Pomoc domowa' },
    Other: { EN: 'Other', ES: 'Otro', RU: 'Другое', UA: 'Інше', CZ: 'Jiné', DE: 'Andere', IT: 'Altro', FR: 'Autre', AR: 'أخرى', PL: 'Inne' },
  };

  return dict[value]?.[language] || value;
}

export default function TopCategoriesBar({
  activeCategory,
  activeSubcategory,
  language,
  onSelectCategory,
  onSelectSubcategory,
  onClearSubcategory,
}: TopCategoriesBarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string>(activeCategory);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setExpandedCategory(activeCategory);
  }, [activeCategory]);

  useEffect(() => {
    if (!menuOpen) return;

    const previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousBodyOverflow;
    };
  }, [menuOpen]);

  const tr = t(language);

  const visibleTopItems = useMemo(() => {
    return horizontalOrder
      .map((id) => categories.find((item) => item.id === id))
      .filter(Boolean) as typeof categories;
  }, []);

  const allOtherCategories = useMemo(() => {
    return categories.filter((item) => !horizontalOrder.includes(item.id));
  }, []);

  const expanded = categories.find((item) => item.id === expandedCategory);

  const overlay =
    mounted && menuOpen
      ? createPortal(
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 2147483647,
              background: 'rgba(17,17,17,0.22)',
            }}
            onClick={() => setMenuOpen(false)}
          >
            <div
              style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                maxWidth: 430,
                margin: '0 auto',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                style={{
                  position: 'absolute',
                  left: 10,
                  right: 10,
                  top: 14,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                  background: '#ffffff',
                  borderRadius: 22,
                  border: '2px solid #111111',
                  padding: '14px 16px',
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 21,
                      fontWeight: 900,
                      color: '#17130f',
                      lineHeight: 1.1,
                    }}
                  >
                    {tr.allCategories}
                  </div>
                  <div
                    style={{
                      marginTop: 4,
                      fontSize: 12,
                      color: '#6f675f',
                      fontWeight: 700,
                    }}
                  >
                    {tr.chooseCategoryAndSubcategory}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 999,
                    border: '2px solid #111111',
                    background: '#ffffff',
                    fontSize: 22,
                    cursor: 'pointer',
                    flexShrink: 0,
                    color: '#17130f',
                    fontWeight: 900,
                  }}
                >
                  ✕
                </button>
              </div>

              <div
                style={{
                  position: 'absolute',
                  left: 10,
                  right: 10,
                  top: 104,
                  bottom: 14,
                  display: 'grid',
                  gridTemplateColumns: '36% 64%',
                  gap: 10,
                  minHeight: 0,
                }}
              >
                <div
                  style={{
                    minHeight: 0,
                    background: '#ffffff',
                    borderRadius: 22,
                    border: '2px solid #111111',
                    padding: 10,
                    overflowY: 'auto',
                    overflowX: 'hidden',
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 900,
                      color: '#17130f',
                      marginBottom: 10,
                      paddingLeft: 4,
                    }}
                  >
                    {tr.categories}
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                      paddingBottom: 4,
                    }}
                  >
                    {categories.map((item) => {
                      const active = expandedCategory === item.id;
                      const src = iconSrcMap[item.id] || iconSrcMap.beauty;
                      const color = colorMap[item.id] || '#43d94d';

                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            setExpandedCategory(item.id);
                            onSelectCategory(item.id);
                            onClearSubcategory();
                          }}
                          style={{
                            border: '1.5px solid #111111',
                            cursor: 'pointer',
                            textAlign: 'left',
                            borderRadius: 14,
                            padding: '8px 7px',
                            background: active ? '#f8f8f8' : '#ffffff',
                            boxShadow: active ? `inset 0 0 0 2px ${color}` : 'none',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            fontWeight: 800,
                            fontSize: 11,
                            minWidth: 0,
                          }}
                        >
                          <div
                            style={{
                              width: 30,
                              height: 30,
                              borderRadius: 9,
                              overflow: 'hidden',
                              flexShrink: 0,
                              background: '#fff',
                              border: '1.5px solid #111111',
                            }}
                          >
                            <img
                              src={src}
                              alt={translateCategoryLabel(item.id, language, item.label)}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                display: 'block',
                              }}
                            />
                          </div>

                          <span
                            style={{
                              color: '#111111',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              fontWeight: 900,
                            }}
                          >
                            {translateCategoryLabel(item.id, language, item.shortLabel || item.label)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div
                  style={{
                    minHeight: 0,
                    background: '#ffffff',
                    borderRadius: 22,
                    border: '2px solid #111111',
                    padding: 12,
                    overflowY: 'auto',
                    overflowX: 'hidden',
                  }}
                >
                  <div
                    style={{
                      fontSize: 17,
                      fontWeight: 900,
                      color: '#17130f',
                      marginBottom: 10,
                    }}
                  >
                    {expanded
                      ? translateCategoryLabel(expanded.id, language, expanded.label)
                      : tr.services}
                  </div>

                  {expanded ? (
                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 8,
                        paddingBottom: 4,
                      }}
                    >
                      {expanded.subcategories.map((sub) => {
                        const active = activeSubcategory === sub;
                        const color = colorMap[expanded.id] || '#43d94d';

                        return (
                          <button
                            key={sub}
                            type="button"
                            onClick={() => {
                              onSelectCategory(expanded.id);
                              onSelectSubcategory(sub);
                              setMenuOpen(false);
                            }}
                            style={{
                              border: '1.5px solid #111111',
                              background: active ? color : '#ffffff',
                              color: active ? '#ffffff' : '#17130f',
                              borderRadius: 999,
                              padding: '9px 12px',
                              fontSize: 12,
                              fontWeight: 900,
                              cursor: 'pointer',
                            }}
                          >
                            {translateSubcategory(sub, language)}
                          </button>
                        );
                      })}
                    </div>
                  ) : null}

                  {allOtherCategories.length > 0 ? (
                    <>
                      <div
                        style={{
                          marginTop: 16,
                          fontSize: 11,
                          fontWeight: 800,
                          color: '#6a7480',
                        }}
                      >
                        {tr.extraCategories}
                      </div>

                      <div
                        style={{
                          marginTop: 10,
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: 8,
                          paddingBottom: 4,
                        }}
                      >
                        {allOtherCategories.map((item) => {
                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => {
                                setExpandedCategory(item.id);
                                onSelectCategory(item.id);
                                onClearSubcategory();
                              }}
                              style={{
                                border: '1.5px solid #111111',
                                background: '#ffffff',
                                color: '#17130f',
                                borderRadius: 999,
                                padding: '7px 10px',
                                fontSize: 11,
                                fontWeight: 900,
                                cursor: 'pointer',
                              }}
                            >
                              {translateCategoryLabel(item.id, language, item.shortLabel || item.label)}
                            </button>
                          );
                        })}
                      </div>
                    </>
                  ) : null}
                </div>
              </div>
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <div
      style={{
        position: 'relative',
        zIndex: 120,
        background: '#f6f4ef',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '50px 1fr',
          gap: 8,
          padding: '0 12px 0',
          alignItems: 'start',
          background: '#f6f4ef',
        }}
      >
        <div
          style={{
            position: 'sticky',
            left: 0,
            background: '#f6f4ef',
            zIndex: 3,
            paddingTop: 1,
          }}
        >
          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            style={{
              border: 'none',
              background: 'transparent',
              padding: 0,
              width: 48,
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <div
              style={{
                width: 48,
                height: 66,
                borderRadius: 16,
                background: '#ffffff',
                boxShadow: '0 1px 0 rgba(0,0,0,0.04)',
                border: '1.5px solid #bdb7af',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <img
                src={iconSrcMap.more}
                alt={tr.more}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
            </div>

            <div
              style={{
                fontSize: 8,
                fontWeight: 800,
                color: '#111111',
                lineHeight: 1,
                whiteSpace: 'nowrap',
              }}
            >
              {tr.more}
            </div>
          </button>
        </div>

        <div
          style={{
            overflowX: 'auto',
            overflowY: 'hidden',
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            paddingBottom: 2,
            paddingRight: 8,
            background: '#f6f4ef',
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: 8,
              minWidth: 'max-content',
              paddingRight: 12,
              alignItems: 'flex-start',
            }}
          >
            {visibleTopItems.map((item) => {
              const isActive = activeCategory === item.id;
              const src = iconSrcMap[item.id];
              const color = colorMap[item.id] || '#43d94d';

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onSelectCategory(item.id);
                    onClearSubcategory();
                  }}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    padding: 0,
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 4,
                    minWidth: 68,
                    flexShrink: 0,
                  }}
                >
                  <div
                    style={{
                      width: 68,
                      height: 68,
                      borderRadius: 18,
                      background: '#ffffff',
                      border: isActive ? `2px solid ${color}` : '1.5px solid #bdb7af',
                      boxShadow: '0 1px 0 rgba(0,0,0,0.04)',
                      overflow: 'hidden',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                    }}
                  >
                    <img
                      src={src}
                      alt={translateCategoryLabel(item.id, language, item.label)}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                      }}
                    />
                  </div>

                  <div
                    style={{
                      fontSize: 8,
                      fontWeight: 800,
                      color: '#111111',
                      lineHeight: 1,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {translateCategoryLabel(item.id, language, item.shortLabel || item.label)}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {overlay}
    </div>
  );
}
