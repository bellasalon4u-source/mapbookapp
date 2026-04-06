'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { categories } from '../services/categories';
import { t, getSavedLanguage, type AppLanguage } from '../services/i18n';

type TopCategoriesBarProps = {
  activeCategory: string;
  activeSubcategory?: string;
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
    beauty: { EN: 'Beauty', RU: 'Красота', UA: 'Краса' },
    barber: { EN: 'Barber', RU: 'Барбер', UA: 'Барбер' },
    wellness: { EN: 'Wellness', RU: 'Велнес', UA: 'Велнес' },
    home: { EN: 'Home', RU: 'Дом', UA: 'Дім' },
    repairs: { EN: 'Repairs', RU: 'Ремонт', UA: 'Ремонт' },
    tech: { EN: 'Tech', RU: 'Техника', UA: 'Техніка' },
    pets: { EN: 'Pets', RU: 'Питомцы', UA: 'Улюбленці' },
    fashion: { EN: 'Fashion', RU: 'Мода', UA: 'Мода' },
    auto: { EN: 'Auto', RU: 'Авто', UA: 'Авто' },
    moving: { EN: 'Moving', RU: 'Переезд', UA: 'Переїзд' },
    fitness: { EN: 'Fitness', RU: 'Фитнес', UA: 'Фітнес' },
    education: { EN: 'Education', RU: 'Обучение', UA: 'Навчання' },
    events: { EN: 'Events', RU: 'События', UA: 'Події' },
    activities: { EN: 'Activities', RU: 'Активности', UA: 'Активності' },
    creative: { EN: 'Creative', RU: 'Креатив', UA: 'Креатив' },
  };

  return map[categoryId]?.[language] || fallback || categoryId;
}

function translateSubcategory(value: string, language: AppLanguage) {
  const dict: Record<string, Record<AppLanguage, string>> = {
    Hair: { EN: 'Hair', RU: 'Волосы', UA: 'Волосся' },
    'Brows & Lashes': { EN: 'Brows & Lashes', RU: 'Брови и ресницы', UA: 'Брови та вії' },
    Nails: { EN: 'Nails', RU: 'Ногти', UA: 'Нігті' },
    Makeup: { EN: 'Makeup', RU: 'Макияж', UA: 'Макіяж' },
    Skincare: { EN: 'Skincare', RU: 'Уход за кожей', UA: 'Догляд за шкірою' },
    Aesthetics: { EN: 'Aesthetics', RU: 'Эстетика', UA: 'Естетика' },

    Haircut: { EN: 'Haircut', RU: 'Стрижка', UA: 'Стрижка' },
    'Beard Trim': { EN: 'Beard Trim', RU: 'Подравнивание бороды', UA: 'Підрівнювання бороди' },
    Shave: { EN: 'Shave', RU: 'Бритьё', UA: 'Гоління' },
    Fade: { EN: 'Fade', RU: 'Фейд', UA: 'Фейд' },
    'Kids Haircut': { EN: 'Kids Haircut', RU: 'Детская стрижка', UA: 'Дитяча стрижка' },
    Styling: { EN: 'Styling', RU: 'Укладка', UA: 'Укладання' },

    Massage: { EN: 'Massage', RU: 'Массаж', UA: 'Масаж' },
    Spa: { EN: 'Spa', RU: 'Спа', UA: 'Спа' },
    Relaxation: { EN: 'Relaxation', RU: 'Релакс', UA: 'Релакс' },
    Recovery: { EN: 'Recovery', RU: 'Восстановление', UA: 'Відновлення' },
    'Holistic Care': { EN: 'Holistic Care', RU: 'Холистический уход', UA: 'Холістичний догляд' },
    'Therapy Support': { EN: 'Therapy Support', RU: 'Терапевтическая помощь', UA: 'Терапевтична підтримка' },

    Cleaning: { EN: 'Cleaning', RU: 'Уборка', UA: 'Прибирання' },
    'Deep Cleaning': { EN: 'Deep Cleaning', RU: 'Глубокая чистка', UA: 'Глибоке прибирання' },
    'Garden Help': { EN: 'Garden Help', RU: 'Помощь в саду', UA: 'Допомога в саду' },
    Handyman: { EN: 'Handyman', RU: 'Мастер на час', UA: 'Майстер на годину' },
    'Furniture Assembly': { EN: 'Furniture Assembly', RU: 'Сборка мебели', UA: 'Збирання меблів' },
    'Home Help': { EN: 'Home Help', RU: 'Помощь по дому', UA: 'Допомога вдома' },

    'Home Repairs': { EN: 'Home Repairs', RU: 'Ремонт дома', UA: 'Ремонт дому' },
    'Appliance Repair': { EN: 'Appliance Repair', RU: 'Ремонт техники', UA: 'Ремонт техніки' },
    'Furniture Repair': { EN: 'Furniture Repair', RU: 'Ремонт мебели', UA: 'Ремонт меблів' },
    'Shoe Repair': { EN: 'Shoe Repair', RU: 'Ремонт обуви', UA: 'Ремонт взуття' },
    'Clothing Repair': { EN: 'Clothing Repair', RU: 'Ремонт одежды', UA: 'Ремонт одягу' },
    'Watch Repair': { EN: 'Watch Repair', RU: 'Ремонт часов', UA: 'Ремонт годинників' },

    'Phone Repair': { EN: 'Phone Repair', RU: 'Ремонт телефона', UA: 'Ремонт телефону' },
    'Computer Repair': { EN: 'Computer Repair', RU: 'Ремонт компьютера', UA: 'Ремонт комп’ютера' },
    'Laptop Repair': { EN: 'Laptop Repair', RU: 'Ремонт ноутбука', UA: 'Ремонт ноутбука' },
    'Tablet Repair': { EN: 'Tablet Repair', RU: 'Ремонт планшета', UA: 'Ремонт планшета' },
    'TV Setup': { EN: 'TV Setup', RU: 'Настройка ТВ', UA: 'Налаштування ТБ' },
    'Smart Device Help': { EN: 'Smart Device Help', RU: 'Помощь с умными устройствами', UA: 'Допомога зі смарт-пристроями' },

    Tailoring: { EN: 'Tailoring', RU: 'Пошив', UA: 'Пошиття' },
    'Clothing Alterations': { EN: 'Clothing Alterations', RU: 'Подгонка одежды', UA: 'Підгонка одягу' },
    'Custom Sewing': { EN: 'Custom Sewing', RU: 'Индивидуальный пошив', UA: 'Індивідуальне пошиття' },
    'Shoe Care': { EN: 'Shoe Care', RU: 'Уход за обувью', UA: 'Догляд за взуттям' },
    'Bag Repair': { EN: 'Bag Repair', RU: 'Ремонт сумок', UA: 'Ремонт сумок' },

    Grooming: { EN: 'Grooming', RU: 'Груминг', UA: 'Грумінг' },
    'Dog Walking': { EN: 'Dog Walking', RU: 'Выгул собак', UA: 'Вигул собак' },
    'Pet Sitting': { EN: 'Pet Sitting', RU: 'Передержка питомцев', UA: 'Перетримка тварин' },
    'Pet Taxi': { EN: 'Pet Taxi', RU: 'Зоотакси', UA: 'Зоотаксі' },
    'Pet Delivery': { EN: 'Pet Delivery', RU: 'Доставка для питомцев', UA: 'Доставка для тварин' },
    Training: { EN: 'Training', RU: 'Дрессировка', UA: 'Дресирування' },
    'Home Visits': { EN: 'Home Visits', RU: 'Выезды на дом', UA: 'Виїзд додому' },
    'Accessories & Gifts': { EN: 'Accessories & Gifts', RU: 'Аксессуары и подарки', UA: 'Аксесуари та подарунки' },

    'Car Wash': { EN: 'Car Wash', RU: 'Мойка авто', UA: 'Мийка авто' },
    Detailing: { EN: 'Detailing', RU: 'Детейлинг', UA: 'Детейлінг' },
    'Tyre Help': { EN: 'Tyre Help', RU: 'Помощь с шинами', UA: 'Допомога з шинами' },
    'Battery Help': { EN: 'Battery Help', RU: 'Помощь с аккумулятором', UA: 'Допомога з акумулятором' },
    Diagnostics: { EN: 'Diagnostics', RU: 'Диагностика', UA: 'Діагностика' },
    'Driver Service': { EN: 'Driver Service', RU: 'Услуги водителя', UA: 'Послуги водія' },

    'Small Moves': { EN: 'Small Moves', RU: 'Небольшой переезд', UA: 'Невеликий переїзд' },
    'Van Help': { EN: 'Van Help', RU: 'Помощь с фургоном', UA: 'Допомога з фургоном' },
    'Furniture Delivery': { EN: 'Furniture Delivery', RU: 'Доставка мебели', UA: 'Доставка меблів' },
    Courier: { EN: 'Courier', RU: 'Курьер', UA: 'Кур’єр' },
    'Same-Day Delivery': { EN: 'Same-Day Delivery', RU: 'Доставка день в день', UA: 'Доставка в той самий день' },
    'Heavy Item Transport': { EN: 'Heavy Item Transport', RU: 'Перевозка тяжёлых вещей', UA: 'Перевезення важких речей' },

    'Personal Training': { EN: 'Personal Training', RU: 'Персональные тренировки', UA: 'Персональні тренування' },
    Yoga: { EN: 'Yoga', RU: 'Йога', UA: 'Йога' },
    Pilates: { EN: 'Pilates', RU: 'Пилатес', UA: 'Пілатес' },
    Stretching: { EN: 'Stretching', RU: 'Растяжка', UA: 'Розтяжка' },
    'Dance Fitness': { EN: 'Dance Fitness', RU: 'Танцевальный фитнес', UA: 'Танцювальний фітнес' },
    'Outdoor Training': { EN: 'Outdoor Training', RU: 'Тренировки на улице', UA: 'Тренування на вулиці' },

    Languages: { EN: 'Languages', RU: 'Языки', UA: 'Мови' },
    Tutoring: { EN: 'Tutoring', RU: 'Репетиторство', UA: 'Репетиторство' },
    'Music Lessons': { EN: 'Music Lessons', RU: 'Уроки музыки', UA: 'Уроки музики' },
    'Kids Learning': { EN: 'Kids Learning', RU: 'Обучение детей', UA: 'Навчання дітей' },
    'Exam Prep': { EN: 'Exam Prep', RU: 'Подготовка к экзаменам', UA: 'Підготовка до іспитів' },
    'Skill Coaching': { EN: 'Skill Coaching', RU: 'Обучение навыкам', UA: 'Навчання навичкам' },

    Photography: { EN: 'Photography', RU: 'Фотосъёмка', UA: 'Фотозйомка' },
    Videography: { EN: 'Videography', RU: 'Видеосъёмка', UA: 'Відеозйомка' },
    Decor: { EN: 'Decor', RU: 'Декор', UA: 'Декор' },
    'DJ & Music': { EN: 'DJ & Music', RU: 'DJ и музыка', UA: 'DJ і музика' },
    'Makeup for Events': { EN: 'Makeup for Events', RU: 'Макияж для событий', UA: 'Макіяж для подій' },
    'Catering Help': { EN: 'Catering Help', RU: 'Помощь с кейтерингом', UA: 'Допомога з кейтерингом' },

    Tours: { EN: 'Tours', RU: 'Туры', UA: 'Тури' },
    Workshops: { EN: 'Workshops', RU: 'Мастер-классы', UA: 'Майстер-класи' },
    'Kids Activities': { EN: 'Kids Activities', RU: 'Детские активности', UA: 'Дитячі активності' },
    'Art Classes': { EN: 'Art Classes', RU: 'Уроки искусства', UA: 'Уроки мистецтва' },
    'Dance Classes': { EN: 'Dance Classes', RU: 'Уроки танцев', UA: 'Уроки танців' },
    'Outdoor Activities': { EN: 'Outdoor Activities', RU: 'Активности на улице', UA: 'Активності на вулиці' },

    'Graphic Design': { EN: 'Graphic Design', RU: 'Графический дизайн', UA: 'Графічний дизайн' },
    'Content Creation': { EN: 'Content Creation', RU: 'Создание контента', UA: 'Створення контенту' },
    'Photo Editing': { EN: 'Photo Editing', RU: 'Обработка фото', UA: 'Обробка фото' },
    'Video Editing': { EN: 'Video Editing', RU: 'Монтаж видео', UA: 'Монтаж відео' },
    Branding: { EN: 'Branding', RU: 'Брендинг', UA: 'Брендинг' },
    'Social Media Help': { EN: 'Social Media Help', RU: 'Помощь с соцсетями', UA: 'Допомога із соцмережами' },

    Other: { EN: 'Other', RU: 'Другое', UA: 'Інше' },
  };

  return dict[value]?.[language] || value;
}

export default function TopCategoriesBar({
  activeCategory,
  activeSubcategory,
  onSelectCategory,
  onSelectSubcategory,
  onClearSubcategory,
}: TopCategoriesBarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string>(activeCategory);
  const [mounted, setMounted] = useState(false);
  const [language, setLanguage] = useState<AppLanguage>('EN');
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMounted(true);
    setLanguage(getSavedLanguage());
  }, []);

  useEffect(() => {
    setExpandedCategory(activeCategory);
    setLanguage(getSavedLanguage());
  }, [activeCategory, menuOpen]);

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
              pointerEvents: 'auto',
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(0,0,0,0.02)',
              }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            />

            <div
              style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                maxWidth: 430,
                margin: '0 auto',
              }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  left: 10,
                  right: 10,
                  top: 18,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                  background: 'rgba(255,255,255,0.82)',
                  backdropFilter: 'blur(14px)',
                  WebkitBackdropFilter: 'blur(14px)',
                  borderRadius: 24,
                  border: '1px solid rgba(255,255,255,0.72)',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.10)',
                  padding: '16px 18px',
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 22,
                      fontWeight: 900,
                      color: '#233244',
                      lineHeight: 1.1,
                    }}
                  >
                    {tr.allCategories}
                  </div>
                  <div
                    style={{
                      marginTop: 4,
                      fontSize: 13,
                      color: '#6f675f',
                      fontWeight: 700,
                    }}
                  >
                    {tr.chooseCategoryAndSubcategory}
                  </div>
                </div>

                <button
                  onClick={() => setMenuOpen(false)}
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: 999,
                    border: '1px solid rgba(210,205,195,0.9)',
                    background: 'rgba(255,255,255,0.88)',
                    fontSize: 24,
                    cursor: 'pointer',
                    flexShrink: 0,
                    color: '#263545',
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
                  top: 118,
                  height: 'min(320px, 36vh)',
                  display: 'grid',
                  gridTemplateColumns: '34% 66%',
                  gap: 10,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    minHeight: 0,
                    height: '100%',
                    background: 'rgba(255,255,255,0.26)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    borderRadius: 22,
                    border: '1px solid rgba(255,255,255,0.50)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                    padding: 10,
                    overflowY: 'auto',
                    overflowX: 'hidden',
                  }}
                >
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 900,
                      color: '#233244',
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
                          onClick={() => {
                            setExpandedCategory(item.id);
                            onSelectCategory(item.id);
                            onClearSubcategory();
                          }}
                          style={{
                            border: active
                              ? `2px solid ${color}`
                              : '1px solid rgba(255,255,255,0.58)',
                            cursor: 'pointer',
                            textAlign: 'left',
                            borderRadius: 16,
                            padding: '10px 8px',
                            background: active
                              ? 'rgba(255,255,255,0.82)'
                              : 'rgba(255,255,255,0.44)',
                            boxShadow: active ? `0 6px 14px ${color}22` : 'none',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            fontWeight: 800,
                            fontSize: 12,
                            minWidth: 0,
                          }}
                        >
                          <div
                            style={{
                              width: 34,
                              height: 34,
                              borderRadius: 10,
                              overflow: 'hidden',
                              flexShrink: 0,
                              background: '#fff',
                              border: `1.5px solid ${color}`,
                            }}
                          >
                            <img
                              src={src}
                              alt={item.label}
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
                              color,
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
                    height: '100%',
                    background: 'rgba(255,255,255,0.26)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    borderRadius: 22,
                    border: '1px solid rgba(255,255,255,0.50)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                    padding: 14,
                    overflowY: 'auto',
                    overflowX: 'hidden',
                  }}
                >
                  <div
                    style={{
                      fontSize: 18,
                      fontWeight: 900,
                      color: '#233244',
                      marginBottom: 12,
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
                        gap: 10,
                        paddingBottom: 4,
                      }}
                    >
                      {expanded.subcategories.map((sub) => {
                        const active = activeSubcategory === sub;
                        const color = colorMap[expanded.id] || '#43d94d';

                        return (
                          <button
                            key={sub}
                            onClick={() => {
                              onSelectCategory(expanded.id);
                              onSelectSubcategory(sub);
                              setMenuOpen(false);
                            }}
                            style={{
                              border: active
                                ? `2px solid ${color}`
                                : '1px solid rgba(255,255,255,0.58)',
                              background: active
                                ? 'rgba(255,255,255,0.88)'
                                : 'rgba(255,255,255,0.52)',
                              color: active ? color : '#2a3442',
                              borderRadius: 999,
                              padding: '10px 14px',
                              fontSize: 13,
                              fontWeight: 800,
                              cursor: 'pointer',
                              boxShadow: active
                                ? `0 6px 14px ${color}22`
                                : '0 4px 10px rgba(0,0,0,0.04)',
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
                          marginTop: 18,
                          fontSize: 12,
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
                          const color = colorMap[item.id] || '#43d94d';

                          return (
                            <button
                              key={item.id}
                              onClick={() => {
                                setExpandedCategory(item.id);
                                onSelectCategory(item.id);
                                onClearSubcategory();
                              }}
                              style={{
                                border: `1px solid ${color}55`,
                                background: 'rgba(255,255,255,0.52)',
                                color,
                                borderRadius: 999,
                                padding: '8px 11px',
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
      ref={wrapperRef}
      style={{
        position: 'relative',
        zIndex: 120,
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '64px 1fr',
          gap: 10,
          padding: '0 10px',
          alignItems: 'start',
        }}
      >
        <div
          style={{
            position: 'sticky',
            left: 0,
            background: '#f7f3eb',
            zIndex: 3,
            paddingTop: 2,
          }}
        >
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            style={{
              border: 'none',
              background: 'transparent',
              padding: 0,
              width: 56,
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <div
              style={{
                width: 52,
                height: 72,
                borderRadius: 18,
                background: '#fff',
                boxShadow: '0 8px 18px rgba(15,34,56,0.12)',
                border: '1.5px solid rgba(220,220,220,0.95)',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <img
                src={iconSrcMap.more}
                alt="More"
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
                fontSize: 11,
                fontWeight: 900,
                color: colorMap.more,
                lineHeight: 1,
                whiteSpace: 'nowrap',
              }}
            >
              More
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
            paddingBottom: 6,
            paddingRight: 10,
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: 12,
              minWidth: 'max-content',
              paddingRight: 20,
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
                    gap: 8,
                    minWidth: 78,
                    flexShrink: 0,
                    transform: isActive ? 'scale(1.06)' : 'scale(1)',
                    transition: 'transform 0.18s ease',
                  }}
                >
                  <div
                    style={{
                      width: isActive ? 78 : 72,
                      height: isActive ? 78 : 72,
                      borderRadius: 20,
                      background: '#fff',
                      border: isActive
                        ? `2.5px solid ${color}`
                        : '1.5px solid rgba(220,220,220,0.95)',
                      boxShadow: isActive
                        ? `0 8px 20px ${color}22`
                        : '0 5px 14px rgba(0,0,0,0.06)',
                      overflow: 'hidden',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <img
                      src={src}
                      alt={item.label}
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
                      fontSize: isActive ? 12 : 11,
                      fontWeight: 900,
                      color,
                      lineHeight: 1,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {translateCategoryLabel(item.id, language, item.shortLabel || item.label)}
                  </div>

                  <div
                    style={{
                      width: isActive ? 46 : 0,
                      height: 6,
                      borderRadius: 999,
                      background: isActive ? color : 'transparent',
                      boxShadow: isActive ? `0 5px 12px ${color}55` : 'none',
                      transition: 'all 0.18s ease',
                    }}
                  />
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
